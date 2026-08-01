import os
import io
import json
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image, UnidentifiedImageError
from app.ml.advanced_vision import analyze_image_quality, detect_animals_and_behaviors

# Determine the paths relative to this file
# This file is in backend/app/ml/predictor.py
# Models are in backend/ml_models/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "ml_models"
MODEL_PATH = MODEL_DIR / "wildlife_species_model.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"

_MODEL = None
_CLASS_NAMES = None

# Target image size expected by the model
IMG_TARGET_SIZE = (224, 224)
# Supported image extensions
SUPPORTED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def _load_resources():
    """Load the TensorFlow model and class names into memory (singleton pattern)."""
    global _MODEL, _CLASS_NAMES

    try:
        import tensorflow as tf
    except ImportError:
        raise RuntimeError(
            "ML prediction service is temporarily unavailable because TensorFlow is not installed."
        )

    if _MODEL is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        try:
            _MODEL = tf.keras.models.load_model(str(MODEL_PATH))
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")

    if _CLASS_NAMES is None:
        if not CLASS_NAMES_PATH.exists():
            raise FileNotFoundError(f"Class names file not found at {CLASS_NAMES_PATH}")
        try:
            with open(CLASS_NAMES_PATH, "r") as f:
                _CLASS_NAMES = json.load(f)
        except Exception as e:
            raise RuntimeError(f"Failed to load class names: {e}")


def _resolve_class_name(idx: int) -> str:
    """Resolve a predicted index to a human-readable class name."""
    if isinstance(_CLASS_NAMES, list):
        return _CLASS_NAMES[idx] if idx < len(_CLASS_NAMES) else f"Unknown class {idx}"
    elif isinstance(_CLASS_NAMES, dict):
        return _CLASS_NAMES.get(str(idx), _CLASS_NAMES.get(idx, f"Unknown class {idx}"))
    return f"Class {idx}"


def validate_image_bytes(image_bytes: bytes) -> None:
    """
    Validate raw image bytes before saving to disk.
    Raises ValueError if the bytes do not represent a valid, complete image.
    """
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()  # Detects truncated / corrupted data
    except (UnidentifiedImageError, Exception) as e:
        raise ValueError(f"Invalid or corrupted image data: {e}")


def predict_species(image_path: str) -> dict:
    """
    Predicts the wildlife species category from a saved image file.

    Returns a dict with:
        - predicted_category  : str
        - confidence          : float (0–100)
        - top_3_predictions   : list[{species, confidence}]
        - prediction_timestamp: str  (ISO-8601 UTC)
        - image_width         : int
        - image_height        : int
    On error returns {"error": "<message>"}.
    """
    try:
        import tensorflow as tf
        import numpy as np
    except ImportError:
        raise RuntimeError(
            "ML prediction service is temporarily unavailable because TensorFlow is not installed."
        )

    # Load model & class names (no-op after first call)
    try:
        _load_resources()
    except RuntimeError as e:
        if "TensorFlow is not installed" in str(e):
            raise
        return {"error": f"Model loading error: {str(e)}"}
    except Exception as e:
        return {"error": f"Model loading error: {str(e)}"}

    if not os.path.exists(image_path):
        return {"error": f"Image file not found: {image_path}"}

    try:
        # ── Image Preprocessing ──────────────────────────────────────────────
        # Open image and convert to RGB (handles grayscale, RGBA, webp, etc.)
        img = Image.open(image_path).convert("RGB")

        # Capture original dimensions for metadata before resizing
        original_width, original_height = img.size

        # Resize with high-quality LANCZOS resampling
        img_resized = img.resize(IMG_TARGET_SIZE, Image.Resampling.LANCZOS)

        # Normalize to [0, 1] using explicit float32 cast
        img_array = np.array(img_resized, dtype=np.float32) / 255.0

        # Expand dims → shape (1, 224, 224, 3)
        img_batch = np.expand_dims(img_array, axis=0)

        # ── Inference ────────────────────────────────────────────────────────
        # Record exact prediction timestamp (UTC)
        prediction_timestamp = datetime.now(timezone.utc).isoformat()

        raw_predictions = _MODEL.predict(img_batch, verbose=0)
        probs = raw_predictions[0]

        # ── Post-Processing ──────────────────────────────────────────────────
        # Top-5 predictions sorted by confidence (highest first)
        top_k = min(5, len(probs))
        top_k_idx = np.argsort(probs)[-top_k:][::-1]

        top_predictions = []
        for idx in top_k_idx:
            class_confidence = float(probs[idx]) * 100.0
            top_predictions.append({
                "species": _resolve_class_name(int(idx)),
                "confidence": round(class_confidence, 2)
            })

        # Best prediction
        best = top_predictions[0]

        # ── Advanced Vision Additions ────────────────────────────────────────
        # 1. Quality
        grade, metrics = analyze_image_quality(image_path)
        
        # 2. Detections & Counting
        count, detections, detection_source = detect_animals_and_behaviors(image_path, best["species"], best["confidence"])

        return {
            "predicted_category": best["species"],
            "confidence": best["confidence"],
            "top_predictions": top_predictions,
            "prediction_timestamp": prediction_timestamp,
            "image_width": original_width,
            "image_height": original_height,
            "image_quality": grade,
            "quality_metrics": metrics,
            "animal_count": count,
            "detections": detections,
            "detection_source": detection_source
        }

    except Exception as e:
        return {"error": f"Failed to process image or predict: {str(e)}"}
