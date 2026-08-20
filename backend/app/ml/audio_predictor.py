import os
import time
import random
import json
import joblib
from pathlib import Path
from datetime import datetime, timezone
import numpy as np

# Determine the paths relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "ml_models"
MODEL_PATH = MODEL_DIR / "best_bird_model.keras"
SCALER_PATH = MODEL_DIR / "mfcc_scaler.pkl"
ENCODER_PATH = MODEL_DIR / "bird_label_encoder.pkl"
CLASS_NAMES_PATH = MODEL_DIR / "bird_class_names.json"

_AUDIO_MODEL = None
_SCALER = None
_LABEL_ENCODER = None
_CLASS_NAMES = None


def _load_audio_model():
    """Load the bioacoustic TensorFlow model into memory if available."""
    global _AUDIO_MODEL, _SCALER, _LABEL_ENCODER, _CLASS_NAMES
    
    if _AUDIO_MODEL is not None and _SCALER is not None:
        return True
        
    try:
        import tensorflow as tf
        print("Loading model...")
        _AUDIO_MODEL = tf.keras.models.load_model(str(MODEL_PATH))
        print("Model loaded successfully")
    except Exception as e:
        raise RuntimeError(f"Model loading failed: {str(e)}")
        
    try:
        print("Loading scaler...")
        _SCALER = joblib.load(str(SCALER_PATH))
    except Exception as e:
        raise RuntimeError(f"Scaler failed: {str(e)}")
        
    try:
        print("Loading label encoder...")
        _LABEL_ENCODER = joblib.load(str(ENCODER_PATH))
    except Exception as e:
        raise RuntimeError(f"Label decoding failed: {str(e)}")
        
    try:
        print("Loading class names...")
        with open(str(CLASS_NAMES_PATH), 'r') as f:
            _CLASS_NAMES = json.load(f)
    except Exception as e:
        raise RuntimeError(f"Class names loading failed: {str(e)}")
            
    return True


def extract_audio_features(file_path: str):
    """
    Extract MFCC or spectrogram features from audio file.
    Returns features, duration, sample_rate.
    """
    try:
        import librosa
        import soundfile as sf
    except ImportError:
        raise RuntimeError("librosa and soundfile are required for audio prediction. Please install them.")

    try:
        # Load audio using librosa
        y, sr = librosa.load(file_path, sr=22050)
        duration = librosa.get_duration(y=y, sr=sr)
    except Exception as e:
        raise RuntimeError(f"Audio loading failed: {str(e)}")
    
    try:
        # Extract MFCC features
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        
        if mfcc.shape[1] < 173:
            pad_width = 173 - mfcc.shape[1]
            mfcc = np.pad(mfcc, ((0, 0), (0, pad_width)), mode='constant')
        else:
            mfcc = mfcc[:, :173]
    except Exception as e:
        raise RuntimeError(f"MFCC extraction failed: {str(e)}")
    
    # Get channels (soundfile is needed for this since librosa mixes to mono by default)
    try:
        info = sf.info(file_path)
        channels = info.channels
    except:
        channels = 1
    
    return mfcc, duration, sr, y, channels


def validate_audio_file(file_path: str) -> None:
    """Validate that the file is a readable audio file."""
    try:
        import soundfile as sf
        with sf.SoundFile(file_path) as f:
            pass # Valid
    except Exception as e:
        raise ValueError(f"Invalid or corrupted audio data: {e}")


def predict_audio_species(file_path: str) -> dict:
    """
    Predicts wildlife species from a saved audio file.
    """
    if not os.path.exists(file_path):
        raise ValueError(f"Audio file not found: {file_path}")
        
    try:
        start_time = time.time()
        
        # Validate integrity
        validate_audio_file(file_path)
        
        _load_audio_model()
        
        print("Extracting MFCC...")
        mfcc, duration, sr, y, channels = extract_audio_features(file_path)
        print(f"MFCC shape: {mfcc.shape}")
        
        # Record exact prediction timestamp (UTC)
        prediction_timestamp = datetime.utcnow().isoformat()
        
        # Predict
        try:
            features_flat = mfcc.flatten().reshape(1, -1)
            features_scaled = _SCALER.transform(features_flat)
            features_reshaped = features_scaled.reshape(1, 40, 173, 1)
            
            print("Running prediction...")
            raw_predictions = _AUDIO_MODEL.predict(features_reshaped, verbose=0)
            print("Prediction complete.")
        except Exception as e:
            raise RuntimeError(f"Prediction failed: {str(e)}")
        
        try:
            confidences = raw_predictions[0] * 100.0
            predicted_idx = int(np.argmax(confidences))
            best_confidence = round(float(confidences[predicted_idx]), 2)
            predicted_species = _CLASS_NAMES[predicted_idx]
            
            # Build top 5
            top_indices = np.argsort(confidences)[-5:][::-1]
            top_predictions = [
                {"species": _CLASS_NAMES[i], "confidence": round(float(confidences[i]), 2)}
                for i in top_indices
            ]
        except Exception as e:
            raise RuntimeError(f"Label decoding failed: {str(e)}")
        
        # Advanced Bioacoustic Analysis
        from app.ml.advanced_audio import AdvancedAudioAnalysisEngine
        
        audio_engine = AdvancedAudioAnalysisEngine(model_type="Custom TensorFlow")
        
        # 1. Noise & Quality
        audio_quality, snr_db, clipping, silence_pct = audio_engine.analyze_environmental_noise(y, sr)
        
        # 2. Events
        event_count, events, detection_source = audio_engine.detect_acoustic_events(
            duration, predicted_species, best_confidence, y=y, sr=sr
        )

        return {
            "predicted_category": predicted_species,
            "confidence": best_confidence,
            "top_predictions": top_predictions,
            "prediction_timestamp": prediction_timestamp,
            "duration": round(duration, 2),
            "sample_rate": sr,
            "channels": channels,
            "audio_quality": audio_quality,
            "noise_level_db": snr_db,
            "clipping_detected": clipping,
            "silence_percentage": silence_pct,
            "event_count": event_count,
            "events": events,
            "detection_source": detection_source
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e

