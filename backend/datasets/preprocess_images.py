from pathlib import Path

ROOT = Path(__file__).resolve().parent


def preprocess_images() -> list[str]:
    image_dirs = [ROOT / "images" / "snapshot_serengeti", ROOT / "images" / "animal_kingdom", ROOT / "images" / "inaturalist"]
    discovered = []
    for directory in image_dirs:
        if directory.exists():
            discovered.extend(str(path) for path in directory.glob("*"))
    return discovered


if __name__ == "__main__":
    print(preprocess_images())
