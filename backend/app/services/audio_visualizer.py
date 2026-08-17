import librosa
import librosa.display
import matplotlib.pyplot as plt
import os
import numpy as np
import uuid


def generate_visualizations(audio_path):

    y, sr = librosa.load(audio_path, sr=22050)

    output_dir = "uploads/audio_analysis"

    os.makedirs(output_dir, exist_ok=True)

    unique_id = str(uuid.uuid4())

    waveform_file = f"{unique_id}_waveform.png"
    spectrogram_file = f"{unique_id}_spectrogram.png"

    waveform_path = os.path.join(output_dir, waveform_file)
    spectrogram_path = os.path.join(output_dir, spectrogram_file)

    # ---------------- Waveform ---------------- #

    plt.figure(figsize=(12, 3))

    librosa.display.waveshow(y, sr=sr)

    plt.title("Audio Waveform")

    plt.xlabel("Time")

    plt.ylabel("Amplitude")

    plt.tight_layout()

    plt.savefig(waveform_path, dpi=200)

    plt.close()

    # ---------------- Spectrogram ---------------- #

    D = librosa.amplitude_to_db(
        np.abs(librosa.stft(y)),
        ref=np.max
    )

    plt.figure(figsize=(12,4))

    librosa.display.specshow(
        D,
        sr=sr,
        x_axis="time",
        y_axis="log",
        cmap="viridis"
    )

    plt.colorbar(format="%+2.0f dB")

    plt.title("Audio Spectrogram")

    plt.tight_layout()

    plt.savefig(spectrogram_path, dpi=200)

    plt.close()

    return {

        "waveform": f"/uploads/audio_analysis/{waveform_file}",

        "spectrogram": f"/uploads/audio_analysis/{spectrogram_file}"

    }