"""Central configuration and filesystem conventions for dataset management."""
from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
load_dotenv(BACKEND_ROOT / ".env")

def _env_path(name: str, default: Path) -> Path:
    """Use the default path when an environment variable is intentionally blank."""
    return Path(os.getenv(name) or str(default)).expanduser()


DATASET_ROOT = _env_path("DATASET_ROOT", PROJECT_ROOT / "datasets")
DATASET_PATHS = {
    "snapshot_serengeti": _env_path("SNAPSHOT_SERENGETI_PATH", DATASET_ROOT / "images" / "snapshot_serengeti"),
    "animal_kingdom": _env_path("ANIMAL_KINGDOM_PATH", DATASET_ROOT / "images" / "animal_kingdom"),
    "inaturalist": _env_path("INATURALIST_PATH", DATASET_ROOT / "images" / "inaturalist"),
    "birdclef": _env_path("BIRDCLEF_PATH", DATASET_ROOT / "audio" / "birdclef"),
    "gbif": _env_path("GBIF_PATH", DATASET_ROOT / "metadata" / "gbif"),
}
DATASET_URLS = {
    "snapshot_serengeti": "https://lila.science/datasets/snapshot-serengeti/",
    "animal_kingdom": "https://www.kaggle.com/datasets/ashishsaxena/animal-kingdom-image-dataset",
    "inaturalist": "https://www.inaturalist.org/pages/developers",
    "birdclef": "https://www.kaggle.com/competitions/birdclef-2024/data",
    "gbif": "https://www.gbif.org/occurrence/download",
}
SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
SUPPORTED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac"}
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
