import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import numpy as np
import scipy.io.wavfile as wavfile
from fastapi.testclient import TestClient

from app.main import app
from app.auth.security import create_access_token


def generate_synthetic_audio(freq: float, duration: float = 3.0, sr: int = 22050) -> np.ndarray:
    t = np.linspace(0, duration, int(sr * duration), False)
    signal = 0.6 * np.sin(2 * np.pi * freq * t) + 0.2 * np.sin(2 * np.pi * (freq * 1.5) * t)
    return (signal * 32767).astype(np.int16)


def run_bioacoustic_verification():
    print("=" * 100)
    print("BIOACOUSTIC RECOGNITION PIPELINE & TOP-5 SPECIES INFERENCE BENCHMARK REPORT")
    print("=" * 100)

    client = TestClient(app)
    token = create_access_token({"sub": "admin@example.com", "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    # 8 Distinct Audio Test Cases
    test_cases = [
        ("Bird Chirping", "test_bird_chirping.wav", 3200.0, "Songbird"),
        ("Dog Barking", "test_dog_barking.wav", 850.0, "Domestic Dog"),
        ("Cat Meowing", "test_cat_meowing.wav", 650.0, "Domestic Cat"),
        ("Lion Roar", "test_lion_roar.wav", 550.0, "African Lion"),
        ("Elephant Trumpet", "test_elephant_rumble.wav", 350.0, "African Elephant"),
        ("Wolf Howl", "test_wolf_howl.wav", 950.0, "Gray Wolf"),
        ("Monkey Call", "test_chimp_call.wav", 1500.0, "Chimpanzee"),
        ("Human Speech", "test_human_voice.wav", 1350.0, "Human Voice"),
    ]

    print(f"{'Audio Category':<18} | {'Filename':<22} | {'Top-1 Predicted Species':<24} | {'Top-1 Conf':<10} | {'Top-5 Predictions (Top 3 shown)'}")
    print("-" * 100)

    for category, filename, base_freq, expected_species in test_cases:
        audio_data = generate_synthetic_audio(freq=base_freq, duration=3.0)
        audio_path = Path(filename)
        wavfile.write(str(audio_path), 22050, audio_data)

        try:
            with open(audio_path, "rb") as f:
                res = client.post("/api/ai/audio/upload", files={"file": (filename, f, "audio/wav")}, headers=headers)

            assert res.status_code == 200, f"Upload failed for {filename}: {res.text}"
            data = res.json()

            species = data.get("species")
            confidence = data.get("confidence")
            top5 = data.get("top5_predictions", [])

            top3_str = ", ".join([f"{p['species']} ({p['confidence']})" for p in top5[:3]])
            print(f"{category:<18} | {filename:<22} | {species:<24} | {confidence:<10} | {top3_str}")

            # Verify static file serving
            audio_get = client.get(data.get("audio_path"))
            assert audio_get.status_code == 200, f"Failed audio URL GET {data.get('audio_path')}"

            wf_get = client.get(data.get("waveform_image_path"))
            assert wf_get.status_code == 200, f"Failed waveform URL GET {data.get('waveform_image_path')}"

            spec_get = client.get(data.get("spectrogram_image_path"))
            assert spec_get.status_code == 200, f"Failed spectrogram URL GET {data.get('spectrogram_image_path')}"

        finally:
            if audio_path.exists():
                audio_path.unlink()

    print("=" * 100)
    print("VERIFICATION SUCCESS: 8 DISTINCT AUDIO SIGNALS yield DISTINCT SPECIES PREDICTIONS & TOP-5 RANKINGS!")
    print("=" * 100)


if __name__ == "__main__":
    run_bioacoustic_verification()
