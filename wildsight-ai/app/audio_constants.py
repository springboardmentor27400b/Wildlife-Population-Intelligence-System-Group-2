from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_AUDIO = BASE_DIR / "uploads" / "audio"

UPLOAD_AUDIO.mkdir(parents=True, exist_ok=True)