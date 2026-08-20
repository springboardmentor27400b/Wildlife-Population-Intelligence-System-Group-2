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


def verify_datasets() -> dict[str, dict]:
    report: dict[str, dict] = {}
    for name, root in DATASET_PATHS.items():
        files = list(root.rglob("*")) if root.exists() else []
        images = [p for p in files if p.is_file() and p.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS]
        audio = [p for p in files if p.is_file() and p.suffix.lower() in SUPPORTED_AUDIO_EXTENSIONS]
        csv_files = [p for p in files if p.is_file() and p.suffix.lower() == ".csv"]
        metadata = [p for p in files if p.is_file() and ("metadata" in p.name.lower() or p.suffix.lower() in {".json", ".xml", ".parquet"})]
        report[name] = {
            "folder_exists": root.exists(), "images_exist": bool(images), "audio_exist": bool(audio),
            "csv_exists": bool(csv_files), "metadata_exists": bool(metadata), "species_count": len(_species_from_media(images + audio, root)),
            "image_count": len(images), "audio_count": len(audio), "csv_count": len(csv_files), "metadata_count": len(metadata),
        }
        logger.info("Verified %s: %s", name, report[name])
    return report


if __name__ == "__main__":
    print(verify_datasets())
