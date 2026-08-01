"""Dataset quality metrics and a portable CSV report."""
from __future__ import annotations

import csv
import hashlib
from collections import Counter
from pathlib import Path

from scripts.dataset_config import DATASET_PATHS, DATASET_ROOT, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS, configure_logging
from scripts.dataset_loader import load_audio, load_images, load_species

logger = configure_logging()


def _hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""): digest.update(block)
    return digest.hexdigest()


def collect_statistics() -> dict:
    images, audio, species = load_images(), load_audio(), load_species()
    hashes: dict[str, list[str]] = {}
    for path in images + audio:
        try: hashes.setdefault(_hash(path), []).append(str(path))
        except OSError: logger.exception("Could not hash %s", path)
    duplicate_data = [path for matching in hashes.values() if len(matching) > 1 for path in matching]
    missing = [
        name for name, path in DATASET_PATHS.items()
        if not path.exists() or not any(item.name != ".gitkeep" for item in path.rglob("*") if item.is_file())
    ]
    classes = sorted({path.parent.name for path in images + audio if path.parent.name})
    report = {
        "total_images": len(images), "total_audio": len(audio), "species_count": len(species), "classes": classes,
        "average_images_per_species": round(len(images) / len(species), 2) if species else 0,
        "missing_data": missing, "duplicate_data": duplicate_data, "duplicate_count": len(duplicate_data),
    }
    DATASET_ROOT.mkdir(parents=True, exist_ok=True)
    with (DATASET_ROOT / "dataset_report.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=report.keys()); writer.writeheader()
        writer.writerow({key: " | ".join(value) if isinstance(value, list) else value for key, value in report.items()})
    logger.info("Generated dataset_report.csv: images=%s audio=%s", len(images), len(audio))
    return report


if __name__ == "__main__": print(collect_statistics())
