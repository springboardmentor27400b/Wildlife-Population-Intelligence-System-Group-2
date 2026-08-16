"""Validation routines for the five supported source datasets."""
from __future__ import annotations

from collections import Counter
from pathlib import Path

from scripts.dataset_config import DATASET_PATHS, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS, configure_logging

logger = configure_logging()


def _species_from_media(paths: list[Path], root: Path) -> set[str]:
    """Use the immediate class directory, falling back to a filename prefix."""
    species = set()
    for path in paths:
        relative_parent = path.relative_to(root).parent
        species.add(relative_parent.parts[0] if relative_parent.parts else path.stem.split("_")[0])
    return species


DATASET_SOURCES = {
    "snapshot_serengeti": "Snapshot Serengeti (LILA Science)",
    "animal_kingdom": "Animal Kingdom Dataset",
    "inaturalist": "iNaturalist Open Dataset",
    "birdclef": "BirdCLEF Bioacoustics",
    "gbif": "GBIF Global Biodiversity Information Facility",
    "species_images": "Local Wildlife Image Repository",
    "xeno_canto": "Xeno-Canto Avian Soundscape Archive",
    "camera_trap": "Camera Trap Monitoring Network",
    "bird_audio": "Avian Audio Recordings",
}

DATASET_URLS = {
    "snapshot_serengeti": "https://lila.science/datasets/snapshot-serengeti/",
    "animal_kingdom": "https://www.kaggle.com/datasets/ashishsaxena/animal-kingdom-image-dataset",
    "inaturalist": "https://www.inaturalist.org/pages/developers",
    "birdclef": "https://www.kaggle.com/competitions/birdclef-2024/data",
    "gbif": "https://www.gbif.org/occurrence/download",
    "species_images": "https://www.gbif.org",
    "xeno_canto": "https://xeno-canto.org",
    "camera_trap": "https://lila.science",
    "bird_audio": "https://xeno-canto.org",
}


def verify_datasets() -> dict[str, dict]:
    report: dict[str, dict] = {}
    for name, root in DATASET_PATHS.items():
        files = list(root.rglob("*")) if root.exists() else []
        images = [p for p in files if p.is_file() and p.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS and p.name != ".gitkeep"]
        audio = [p for p in files if p.is_file() and p.suffix.lower() in SUPPORTED_AUDIO_EXTENSIONS and p.name != ".gitkeep"]
        csv_files = [p for p in files if p.is_file() and p.suffix.lower() == ".csv"]
        metadata = [p for p in files if p.is_file() and ("metadata" in p.name.lower() or p.suffix.lower() in {".json", ".xml", ".parquet"})]

        total_media = len(images) + len(audio)
        is_verified = root.exists() and total_media > 0

        species_list = _species_from_media(images + audio, root)

        report[name] = {
            "exists": is_verified,
            "folder_exists": root.exists(),
            "status": "Verified" if is_verified else "Dataset Not Found",
            "images_exist": bool(images),
            "audio_exist": bool(audio),
            "csv_exists": bool(csv_files),
            "metadata_exists": bool(metadata),
            "species_count": len(species_list),
            "image_count": len(images),
            "audio_count": len(audio),
            "csv_count": len(csv_files),
            "metadata_count": len(metadata),
            "official_source": DATASET_SOURCES.get(name, name.replace("_", " ").title()),
            "official_download_page": DATASET_URLS.get(name, "https://www.gbif.org")
        }
        logger.info("Verified %s: status=%s images=%s audio=%s", name, report[name]["status"], len(images), len(audio))
    return report



if __name__ == "__main__":
    print(verify_datasets())
