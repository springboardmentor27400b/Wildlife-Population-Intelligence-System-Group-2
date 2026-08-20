import os
import tensorflow_hub as hub
import librosa
import numpy as np

print("Loading YAMNet...")
model = hub.load("https://tfhub.dev/google/yamnet/1")
print("YAMNet Loaded Successfully")


def analyze_audio(audio_path):
    try:
        print("=" * 50)
        print("Reading audio:", audio_path)

        # Load audio as mono with 16kHz sampling rate
        waveform, sr = librosa.load(audio_path, sr=16000)

        print("Sample Rate:", sr)
        print("Waveform Length:", len(waveform))

        waveform = waveform.astype(np.float32)

        print("Running YAMNet Prediction...")

        scores, embeddings, spectrogram = model(waveform)

        scores_np = scores.numpy()

        predicted_class = int(np.argmax(scores_np.mean(axis=0)))

        confidence = float(np.max(scores_np.mean(axis=0))) * 100

        print("Prediction Complete")
        print("Predicted Class:", predicted_class)
        print("Confidence:", confidence)

        # Display uploaded filename as species (temporary)
        filename = os.path.basename(audio_path)

        species_name = os.path.splitext(filename)[0]

        species_name = species_name.replace("_", " ")
        species_name = species_name.replace("-", " ")

        return {
            "species": species_name,
            "confidence": round(confidence, 2),
            "analysis_report": (
                f"Species: {species_name}\n"
                f"Predicted Class ID: {predicted_class}\n"
                f"Confidence: {round(confidence,2)}%\n"
                f"Model: YAMNet"
            )
        }

    except Exception as e:

        print("=" * 50)
        print("YAMNet ERROR")
        print(str(e))

        return {
            "species": "Unknown",
            "confidence": 0.0,
            "analysis_report": str(e)
        }