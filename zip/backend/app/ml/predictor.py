import os
import json
from pathlib import Path
from PIL import Image

# Determine the paths relative to this file
# This file is in backend/app/ml/predictor.py
# Models are in backend/ml_models/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "ml_models"
MODEL_PATH = MODEL_DIR / "wildlife_species_model.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"

_MODEL = None
_CLASS_NAMES = None

def _load_resources():
    global _MODEL, _CLASS_NAMES
    
    try:
        import tensorflow as tf
    except ImportError:
        raise RuntimeError("ML prediction service is temporarily unavailable because TensorFlow is not installed.")

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

def predict_species(image_path: str):
    """
    Predicts the species from an image.
    """
    try:
        import tensorflow as tf
        import numpy as np
    except ImportError:
        raise RuntimeError("ML prediction service is temporarily unavailable because TensorFlow is not installed.")

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
        # Open and process the image
        img = Image.open(image_path).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = _MODEL.predict(img_batch)
        
        # Determine the predicted class and confidence
        predicted_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0])) * 100
        
        # Get top 3 predictions
        top_3_idx = np.argsort(predictions[0])[-3:][::-1]
        top_3 = []
        for idx in top_3_idx:
            c = float(predictions[0][idx]) * 100
            
            if isinstance(_CLASS_NAMES, list):
                if idx < len(_CLASS_NAMES):
                    class_name = _CLASS_NAMES[idx]
                else:
                    class_name = f"Unknown class {idx}"
            elif isinstance(_CLASS_NAMES, dict):
                if str(idx) in _CLASS_NAMES:
                    class_name = _CLASS_NAMES[str(idx)]
                elif idx in _CLASS_NAMES:
                    class_name = _CLASS_NAMES[idx]
                else:
                    class_name = f"Unknown class {idx}"
            else:
                class_name = f"Class {idx}"
                
            top_3.append({
                "species": class_name,
                "confidence": round(c, 2)
            })
            
        return {
            "predicted_category": top_3[0]["species"],
            "confidence": top_3[0]["confidence"],
            "top_3_predictions": top_3
        }
    except Exception as e:
        return {"error": f"Failed to process image or predict: {str(e)}"}
