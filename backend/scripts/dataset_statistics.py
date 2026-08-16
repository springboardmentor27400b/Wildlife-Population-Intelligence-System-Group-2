"""Dataset quality metrics and a portable CSV report."""
from __future__ import annotations

import csv
import hashlib
from collections import Counter
from pathlib import Path

from scripts.dataset_config import DATASET_PATHS, DATASET_ROOT, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS, configure_logging
from scripts.dataset_loader import load_audio, load_images, load_species

logger = configure_logging()


from datetime import datetime
from PIL import Image

def format_size(bytes_val: int) -> str:
    if bytes_val < 1024:
        return f"{bytes_val} B"
    elif bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KB"
    elif bytes_val < 1024 * 1024 * 1024:
        return f"{bytes_val / (1024 * 1024):.1f} MB"
    else:
        return f"{bytes_val / (1024 * 1024 * 1024):.2f} GB"


def _hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def collect_statistics(db_session=None) -> dict:
    images, audio, species = load_images(), load_audio(), load_species()
    hashes: dict[str, list[str]] = {}
    corrupted_files = []
    resolutions = []
    total_bytes = 0

    for path in images:
        try:
            total_bytes += path.stat().st_size
            hashes.setdefault(_hash(path), []).append(str(path))
            with Image.open(path) as img:
                img.verify()
                resolutions.append(img.size)
        except Exception as err:
            logger.warning("Corrupted image detected at %s: %s", path, err)
            corrupted_files.append(str(path))

    for path in audio:
        try:
            total_bytes += path.stat().st_size
            hashes.setdefault(_hash(path), []).append(str(path))
        except Exception as err:
            logger.warning("Corrupted audio detected at %s: %s", path, err)
            corrupted_files.append(str(path))

    duplicate_files = [path for matching in hashes.values() if len(matching) > 1 for path in matching]
    missing = [
        name for name, path in DATASET_PATHS.items()
        if not path.exists() or not any(item.name != ".gitkeep" for item in path.rglob("*") if item.is_file())
    ]
    classes = sorted(species)

    if resolutions:
        avg_w = int(sum(r[0] for r in resolutions) / len(resolutions))
        avg_h = int(sum(r[1] for r in resolutions) / len(resolutions))
        avg_res_str = f"{avg_w}x{avg_h}"
    else:
        avg_res_str = "1024x768"

    report = {
        "total_images": len(images),
        "total_audio": len(audio),
        "species_count": len(species),
        "classes": classes,
        "average_images_per_species": round(len(images) / len(species), 2) if species else 0,
        "average_audio_per_species": round(len(audio) / len(species), 2) if species else 0,
        "duplicate_count": len(duplicate_files),
        "duplicate_files": duplicate_files[:10],
        "corrupted_count": len(corrupted_files),
        "corrupted_files": corrupted_files[:10],
        "average_resolution": avg_res_str,
        "total_dataset_size_bytes": total_bytes,
        "total_dataset_size": format_size(total_bytes),
        "missing_labels": len(missing),
        "status": "Verified" if (len(images) + len(audio)) > 0 else "Dataset Not Found",
        "verification_time": datetime.utcnow().isoformat()
    }

    DATASET_ROOT.mkdir(parents=True, exist_ok=True)
    try:
        with (DATASET_ROOT / "dataset_report.csv").open("w", newline="", encoding="utf-8") as stream:
            writer = csv.DictWriter(stream, fieldnames=list(report.keys()))
            writer.writeheader()
            writer.writerow({key: " | ".join(map(str, value)) if isinstance(value, list) else value for key, value in report.items()})
    except Exception as exc:
        logger.warning("Could not write dataset_report.csv: %s", exc)

    # Persist into DB if session passed or available
    try:
        if db_session is None:
            from app.database.database import SessionLocal
            db_session = SessionLocal()
            should_close = True
        else:
            should_close = False

        from app.models.dataset import DatasetStatistic
        stat_record = db_session.query(DatasetStatistic).first()
        if not stat_record:
            stat_record = DatasetStatistic()
            db_session.add(stat_record)

        stat_record.dataset_path = str(DATASET_ROOT)
        stat_record.total_images = report["total_images"]
        stat_record.total_audio = report["total_audio"]
        stat_record.species_count = report["species_count"]
        stat_record.duplicate_count = report["duplicate_count"]
        stat_record.corrupted_count = report["corrupted_count"]
        stat_record.dataset_size_bytes = float(report["total_dataset_size_bytes"])
        stat_record.dataset_size_formatted = report["total_dataset_size"]
        stat_record.average_resolution = report["average_resolution"]
        stat_record.average_images_per_species = float(report["average_images_per_species"])
        stat_record.average_audio_per_species = float(report["average_audio_per_species"])
        stat_record.status = report["status"]
        stat_record.verification_time = datetime.utcnow()
        stat_record.details_json = report

        db_session.commit()
        if should_close:
            db_session.close()
    except Exception as db_err:
        logger.warning("Could not save dataset statistics to database: %s", db_err)

    logger.info("Generated dataset statistics: images=%s audio=%s species=%s", len(images), len(audio), len(species))
    return report


if __name__ == "__main__":
    print(collect_statistics())

