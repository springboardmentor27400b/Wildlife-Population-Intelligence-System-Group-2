"""Audio conversion, normalization and feature extraction for bird-call datasets."""
from __future__ import annotations

from scripts.dataset_config import DATASET_PATHS, PROCESSED_AUDIO_DIR, SUPPORTED_AUDIO_EXTENSIONS, configure_logging

logger = configure_logging()


def preprocess_audio(sample_rate: int = 32_000, n_mfcc: int = 40) -> dict:
    try:
        import librosa
        import numpy as np
        import soundfile as sf
    except ImportError as exc:
        raise RuntimeError("librosa, NumPy, and SoundFile are required for audio preprocessing. Install backend/requirements.txt.") from exc

    def reduce_noise(samples):
        """A lightweight spectral gate that needs no optional native dependency."""
        stft = librosa.stft(samples)
        magnitude, phase = np.abs(stft), np.angle(stft)
        noise_floor = np.median(magnitude, axis=1, keepdims=True)
        cleaned = np.maximum(magnitude - noise_floor * 0.75, 0.0)
        return librosa.istft(cleaned * np.exp(1j * phase), length=len(samples))

    output = PROCESSED_AUDIO_DIR
    mfcc_dir, spectrogram_dir = output / "mfcc", output / "mel_spectrograms"
    for directory in (output, mfcc_dir, spectrogram_dir): directory.mkdir(parents=True, exist_ok=True)
    result = {"processed": 0, "failed": 0, "total_duration_seconds": 0.0, "files": []}
    for dataset, root in DATASET_PATHS.items():
        if not root.exists(): continue
        for source in root.rglob("*"):
            if not source.is_file() or source.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS: continue
            try:
                audio, _ = librosa.load(source, sr=sample_rate, mono=True)
                if audio.size == 0: raise ValueError("empty audio stream")
                audio = reduce_noise(audio)
                peak = float(np.max(np.abs(audio)))
                if peak: audio = audio / peak * 0.95
                stem = f"{dataset}__{source.stem}"
                wav_path = output / f"{stem}.wav"
                sf.write(wav_path, audio, sample_rate, subtype="PCM_16")
                mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=n_mfcc)
                mel = librosa.feature.melspectrogram(y=audio, sr=sample_rate, n_mels=128)
                np.save(mfcc_dir / f"{stem}.npy", mfcc)
                np.save(spectrogram_dir / f"{stem}.npy", librosa.power_to_db(mel, ref=np.max))
                duration = round(len(audio) / sample_rate, 3)
                result["processed"] += 1; result["total_duration_seconds"] += duration
                result["files"].append({"source": str(source), "output": str(wav_path), "duration_seconds": duration})
            except Exception as exc:  # decoder errors vary by installed backend
                result["failed"] += 1; logger.exception("Audio preprocessing failed for %s: %s", source, exc)
    result["total_duration_seconds"] = round(result["total_duration_seconds"], 3)
    logger.info("Audio preprocessing complete: %s", {k: v for k, v in result.items() if k != "files"})
    return result


if __name__ == "__main__": print(preprocess_audio())
