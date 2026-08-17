import librosa
import numpy as np


def analyse_bird_call(audio_path):

    y, sr = librosa.load(audio_path, sr=22050)

    # Duration
    duration = round(librosa.get_duration(y=y, sr=sr), 2)

    # RMS Energy
    rms = np.mean(librosa.feature.rms(y=y))

    signal_strength = round(rms * 1000)

    signal_strength = min(max(signal_strength, 40), 99)

    # Zero Crossing Rate

    zcr = np.mean(librosa.feature.zero_crossing_rate(y))

    # Spectral Centroid

    centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))

    dominant_frequency = int(centroid)

    # Pitch

    if dominant_frequency > 3500:
        pitch = "High"

    elif dominant_frequency > 2200:
        pitch = "Medium"

    else:
        pitch = "Low"

    # Complexity

    if zcr > 0.15:
        complexity = "High"

    elif zcr > 0.08:
        complexity = "Medium"

    else:
        complexity = "Low"

    # Pattern

    if duration > 15:
        pattern = "Continuous"

    elif duration > 7:
        pattern = "Repeated"

    else:
        pattern = "Single"

    # Quality

    if signal_strength > 90:
        quality = "Excellent"

    elif signal_strength > 75:
        quality = "Very Good"

    else:
        quality = "Good"

    return {

        "dominant_frequency": f"{dominant_frequency} Hz",

        "duration": f"{duration} sec",

        "pitch": pitch,

        "signal_strength": f"{signal_strength}%",

        "complexity": complexity,

        "pattern": pattern,

        "quality": quality

    }