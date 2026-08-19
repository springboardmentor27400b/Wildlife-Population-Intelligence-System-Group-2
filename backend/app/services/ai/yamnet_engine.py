import os
import sys
import logging
import urllib.request
import numpy as np
try:
    import librosa
except ImportError:
    librosa = None
try:
    import tensorflow as tf
except ImportError:
    tf = None
from app.services.ai.audio_quality_service import analyze_audio_quality

logger = logging.getLogger("yamnet_engine")

WEIGHTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "weights", "yamnet"))
MODEL_PATH = os.path.join(WEIGHTS_DIR, "yamnet.tflite")
LABELS_PATH = os.path.join(WEIGHTS_DIR, "yamnet_labels.txt")

MODEL_URL = "https://huggingface.co/thelou1s/yamnet/resolve/main/lite-model_yamnet_classification_tflite_1.tflite"
LABELS_URL = "https://huggingface.co/thelou1s/yamnet/resolve/main/labels_yamnet.txt"

# Comprehensive AudioSet Class Mapping for Target Animal Categories
CATEGORY_KEYWORDS = {
    "Mammal": [
        "mammal", "roar", "bark", "yip", "howl", "growl", "bay", "cat", "meow",
        "purr", "hiss", "caterwaul", "cattle", "moo", "cow", "pig", "oink", "goat",
        "bleat", "sheep", "horse", "neigh", "whinny", "snort", "donkey", "mule", "bray",
        "lion", "tiger", "bear", "elephant", "rodent", "mouse", "monkey", "gorilla",
        "chimpanzee", "wild animals", "carnivore", "canidae", "felidae", "domestic animals", "dog"
    ],
    "Amphibian": [
        "amphibian", "frog", "croak", "toad", "bullfrog", "tree frog", "ribbit"
    ],
    "Insect": [
        "insect", "cricket", "chirp", "buzz", "mosquito", "fly", "housefly", "bee",
        "wasp", "zizz", "cicada", "locust", "grasshopper", "dragonfly"
    ]
}

from app.services.ai.gcs_model_sync import ensure_model_file

def ensure_yamnet_weights():
    """
    Ensures YAMNet model weights and label files exist locally.
    1. Checks local cache.
    2. Preferred source: Google Cloud Storage.
    3. Fallback source: Hugging Face.
    """
    os.makedirs(WEIGHTS_DIR, exist_ok=True)

    headers = {"User-Agent": "Mozilla/5.0"}
    if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1000:
        logger.info("[YAMNet] Checking GCS for YAMNet TFLite weights...")
        synced = ensure_model_file("yamnet/yamnet.tflite", MODEL_PATH, min_bytes=1000)
        if not synced or not os.path.exists(MODEL_PATH):
            logger.info(f"[YAMNet] Downloading YAMNet TFLite weights from Hugging Face ({MODEL_URL})...")
            try:
                import requests
                r = requests.get(MODEL_URL, headers=headers, timeout=30)
                if r.status_code == 200:
                    with open(MODEL_PATH, "wb") as f:
                        f.write(r.content)
                else:
                    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
            except Exception as e:
                logger.error(f"[YAMNet] Failed to download YAMNet model weights: {e}")
                raise IOError(f"Failed to download YAMNet model weights: {e}")

    if not os.path.exists(LABELS_PATH) or os.path.getsize(LABELS_PATH) < 100:
        logger.info("[YAMNet] Checking GCS for YAMNet labels...")
        synced_labels = ensure_model_file("yamnet/yamnet_labels.txt", LABELS_PATH, min_bytes=100)
        if not synced_labels or not os.path.exists(LABELS_PATH):
            logger.info(f"[YAMNet] Downloading YAMNet label file from Hugging Face ({LABELS_URL})...")
            try:
                import requests
                r = requests.get(LABELS_URL, headers=headers, timeout=30)
                if r.status_code == 200:
                    with open(LABELS_PATH, "wb") as f:
                        f.write(r.content)
                else:
                    urllib.request.urlretrieve(LABELS_URL, LABELS_PATH)
            except Exception as e:
                logger.error(f"[YAMNet] Failed to download YAMNet labels: {e}")

def run_yamnet_inference(audio_path: str) -> dict:
    """
    Independent YAMNet audio classifier for determining broad animal categories.
    Determines ONLY one of: 'Mammal', 'Amphibian', 'Insect', or 'Unknown Wildlife'.
    Does NOT perform species identification.
    """
    ensure_yamnet_weights()

    # Analyze audio quality
    quality_info = analyze_audio_quality(audio_path)

    # Load audio at 16kHz mono
    y, sr = librosa.load(audio_path, sr=16000, mono=True)
    if len(y) == 0:
        return {
            "animal_category": "Unknown Wildlife",
            "confidence": 0.0,
            "audio_quality": quality_info,
            "raw_class_scores": {}
        }

    # Normalize waveform to [-1.0, 1.0]
    max_val = np.max(np.abs(y))
    if max_val > 0:
        y = y / max_val
    y = y.astype(np.float32)

    # Load TFLite model
    interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    input_size = input_details[0]['shape'][0] # 15600 samples (0.975s)

    # Pad audio if shorter than 1 frame
    if len(y) < input_size:
        y = np.pad(y, (0, input_size - len(y)), mode='constant')

    step = input_size // 2 # 50% overlap
    frame_scores = []

    for start in range(0, len(y) - input_size + 1, step):
        frame = y[start:start + input_size]
        interpreter.set_tensor(input_details[0]['index'], frame)
        interpreter.invoke()
        score = interpreter.get_tensor(output_details[0]['index'])[0]
        frame_scores.append(score)

    if len(frame_scores) == 0:
        mean_scores = np.zeros((521,), dtype=np.float32)
    else:
        mean_scores = np.mean(frame_scores, axis=0)

    # Read class labels
    labels = []
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, "r", encoding="utf-8") as f:
            labels = [line.strip().lower() for line in f.readlines()]

    category_scores = {"Mammal": 0.0, "Amphibian": 0.0, "Insect": 0.0}

    for idx, score in enumerate(mean_scores):
        lbl = labels[idx] if idx < len(labels) else ""
        for cat, keywords in CATEGORY_KEYWORDS.items():
            if any(kw in lbl for kw in keywords):
                if float(score) > category_scores[cat]:
                    category_scores[cat] = float(score)

    # Find category with highest confidence
    best_cat = max(category_scores, key=category_scores.get)
    best_conf = category_scores[best_cat]

    # Category threshold check (15% confidence required for category assignment)
    if best_conf < 0.15:
        final_category = "Unknown Wildlife"
        final_confidence = round(best_conf, 4)
    else:
        final_category = best_cat
        final_confidence = round(best_conf, 4)

    return {
        "animal_category": final_category,
        "confidence": final_confidence,
        "audio_quality": quality_info,
        "category_scores": category_scores
    }
