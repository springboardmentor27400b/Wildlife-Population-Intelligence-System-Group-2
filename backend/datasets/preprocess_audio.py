from pathlib import Path

ROOT = Path(__file__).resolve().parent


def preprocess_audio() -> list[str]:
    audio_dir = ROOT / "audio" / "birdclef"
    if not audio_dir.exists():
        return []
    return [str(path) for path in audio_dir.glob("*")]


if __name__ == "__main__":
    print(preprocess_audio())
