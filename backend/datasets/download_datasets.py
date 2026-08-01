import os
from pathlib import Path

DATASET_ROOT = Path(__file__).resolve().parent


def ensure_dataset_folder(relative_path: str) -> Path:
    path = DATASET_ROOT / relative_path
    path.mkdir(parents=True, exist_ok=True)
    return path


if __name__ == "__main__":
    ensure_dataset_folder("images/snapshot_serengeti")
    ensure_dataset_folder("images/animal_kingdom")
    ensure_dataset_folder("images/inaturalist")
    ensure_dataset_folder("audio/birdclef")
    ensure_dataset_folder("metadata/gbif")
    print("Dataset folders prepared. Add your preferred download source or mount existing data into these directories.")
