import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import csv
import os
import librosa


print("Loading YAMNet...")

model = hub.load(
    "https://tfhub.dev/google/yamnet/1"
)

print("YAMNet Loaded Successfully")


# ============================================
# LOAD YAMNET CLASS NAMES
# ============================================

CLASS_NAMES = []

csv_path = os.path.join(
    os.path.dirname(__file__),
    "yamnet_class_map.csv"
)

with open(
    csv_path,
    newline="",
    encoding="utf-8"
) as f:

    reader = csv.DictReader(f)

    for row in reader:
        CLASS_NAMES.append(
            row["display_name"]
        )


# ============================================
# AUDIO DETECTION
# ============================================

def detect_audio(audio_path: str):

    print("Analyzing audio:", audio_path)

    if not os.path.exists(audio_path):
        raise FileNotFoundError(
            f"Audio file not found: {audio_path}"
        )

    try:
        # Load audio
        # MP3/WAV supported by librosa
        # Convert to mono
        # Resample to 16 kHz
        waveform, sample_rate = librosa.load(
            audio_path,
            sr=16000,
            mono=True
        )

    except Exception as e:
        raise RuntimeError(
            f"Failed to load audio file: {str(e)}"
        )

    if waveform is None or len(waveform) == 0:
        raise ValueError(
            "Audio file contains no valid audio data"
        )

    print("Audio loaded successfully")
    print("Sample rate:", sample_rate)

    duration = len(waveform) / sample_rate

    print(
        "Audio duration:",
        duration,
        "seconds"
    )

    # Run YAMNet
    scores, embeddings, spectrogram = model(
        waveform
    )

    # Calculate average prediction
    mean_scores = tf.reduce_mean(
        scores,
        axis=0
    )

    # Get top 5 predictions
    top_k = tf.math.top_k(
        mean_scores,
        k=5
    )

    predictions = []

    for i in range(5):

        class_id = int(
            top_k.indices[i]
        )

        confidence = float(
            top_k.values[i]
        )

        predictions.append({

            "class_id": class_id,

            "label":
                CLASS_NAMES[class_id],

            "confidence":
                round(
                    confidence,
                    3
                )

        })

    return {

        "label":
            predictions[0]["label"],

        "confidence":
            predictions[0]["confidence"],

        "class_id":
            predictions[0]["class_id"],

        "top_predictions":
            predictions

    }