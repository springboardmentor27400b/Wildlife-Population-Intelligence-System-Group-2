import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def get_dataset_config() -> dict[str, str]:
    return {
        "snapshot_serengeti": os.getenv("DATASET_SNAPSHOT_SERENGETI", str(ROOT / "images" / "snapshot_serengeti")),
        "animal_kingdom": os.getenv("DATASET_ANIMAL_KINGDOM", str(ROOT / "images" / "animal_kingdom")),
        "inaturalist": os.getenv("DATASET_INATURALIST", str(ROOT / "images" / "inaturalist")),
        "birdclef": os.getenv("DATASET_BIRDCLIEF", str(ROOT / "audio" / "birdclef")),
        "gbif": os.getenv("DATASET_GBIF", str(ROOT / "metadata" / "gbif")),
    }


def detect_dataset_status() -> dict[str, bool]:
    config = get_dataset_config()
    return {name: Path(path).exists() for name, path in config.items()}


if __name__ == "__main__":
    print(detect_dataset_status())
