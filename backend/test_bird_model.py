import os
import json
import joblib
import numpy as np
import tensorflow as tf
from pathlib import Path

MODEL_DIR = Path(r"e:\Ai projects\Wildlife Population Intelligence System\backend\ml_models")

def test_load():
    try:
        print("Loading model...")
        model = tf.keras.models.load_model(str(MODEL_DIR / "best_bird_model.keras"))
        print("Model loaded successfully.")
        
        print("Loading label encoder...")
        encoder = joblib.load(str(MODEL_DIR / "bird_label_encoder.pkl"))
        print(f"Classes: {encoder.classes_}")

        print("Loading class names...")
        with open(str(MODEL_DIR / "bird_class_names.json"), 'r') as f:
            class_names = json.load(f)
        print(f"Class names: {class_names}")
        
        print("Loading scaler...")
        scaler = joblib.load(str(MODEL_DIR / "mfcc_scaler.pkl"))
        print("Scaler loaded successfully.")
        
        # input shape check
        print(f"Model input shape: {model.input_shape}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_load()
