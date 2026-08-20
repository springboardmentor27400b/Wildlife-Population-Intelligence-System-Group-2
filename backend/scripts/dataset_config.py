"""Central configuration and filesystem conventions for dataset management."""
from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
load_dotenv(BACKEND_ROOT / ".env")

def resolve_dataset_root() -> Path:
    env_dataset = os.getenv("DATASET_PATH") or os.getenv("DATASET_ROOT")
    if env_dataset:
        candidate = Path(env_dataset).expanduser()
        if candidate.exists():
            return candidate
        if not candidate.is_absolute():
            if (PROJECT_ROOT / candidate).exists():
                return PROJECT_ROOT / candidate
            if (BACKEND_ROOT / candidate).exists():
                return BACKEND_ROOT / candidate
        return PROJECT_ROOT / candidate
    for default_path in [PROJECT_ROOT / "datasets", PROJECT_ROOT / "dataset", BACKEND_ROOT / "datasets", BACKEND_ROOT / "dataset"]:
        if default_path.exists():
            return default_path
    return PROJECT_ROOT / "datasets"


DATASET_ROOT = resolve_dataset_root()

DATASET_PATHS = {
    "snapshot_serengeti": DATASET_ROOT / "images" / "snapshot_serengeti" if (DATASET_ROOT / "images" / "snapshot_serengeti").exists() else DATASET_ROOT / "snapshot_serengeti",
    "animal_kingdom": DATASET_ROOT / "images" / "animal_kingdom" if (DATASET_ROOT / "images" / "animal_kingdom").exists() else DATASET_ROOT / "animal_kingdom",
    "inaturalist": DATASET_ROOT / "images" / "inaturalist" if (DATASET_ROOT / "images" / "inaturalist").exists() else DATASET_ROOT / "inaturalist",
    "birdclef": DATASET_ROOT / "audio" / "birdclef" if (DATASET_ROOT / "audio" / "birdclef").exists() else DATASET_ROOT / "birdclef",
    "gbif": DATASET_ROOT / "metadata" / "gbif" if (DATASET_ROOT / "metadata" / "gbif").exists() else DATASET_ROOT / "gbif",
    "species_images": DATASET_ROOT / "species_images",
    "xeno_canto": DATASET_ROOT / "audio" / "xeno_canto" if (DATASET_ROOT / "audio" / "xeno_canto").exists() else DATASET_ROOT / "xeno_canto",
    "camera_trap": DATASET_ROOT / "images" / "camera_trap" if (DATASET_ROOT / "images" / "camera_trap").exists() else DATASET_ROOT / "camera_trap",
    "bird_audio": DATASET_ROOT / "audio" / "bird_audio" if (DATASET_ROOT / "audio" / "bird_audio").exists() else DATASET_ROOT / "bird_audio",
}

SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
SUPPORTED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}
PROCESSED_IMAGES_DIR = DATASET_ROOT / "processed" / "images"
PROCESSED_AUDIO_DIR = DATASET_ROOT / "processed" / "audio"
SPLIT_DIRS = {name: DATASET_ROOT / name for name in ("train", "validation", "test")}
LOG_FILE = BACKEND_ROOT / "logs" / "dataset.log"



def configure_logging() -> logging.Logger:
    """Return a shared, file-backed dataset logger without duplicate handlers."""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("dataset_management")
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
        logger.addHandler(handler)
    return logger
