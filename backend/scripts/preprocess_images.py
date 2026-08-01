"""Image preprocessing for classification and YOLO-compatible training data."""
from __future__ import annotations

import shutil
from pathlib import Path

from scripts.dataset_config import DATASET_PATHS, PROCESSED_IMAGES_DIR, SUPPORTED_IMAGE_EXTENSIONS, configure_logging

logger = configure_logging()


def _class_name(root: Path, image_path: Path) -> str:
    parent = image_path.relative_to(root).parent
    return parent.parts[0] if parent.parts else "unclassified"


def preprocess_images(image_size: tuple[int, int] = (640, 640), thumbnail_size: tuple[int, int] = (160, 160)) -> dict:
    """Convert valid images to RGB JPEG, create thumbnails and YOLO label placeholders.

    Existing ``.txt`` labels are retained; otherwise an empty label file marks an
    unannotated image rather than fabricating detection boxes.
    """
    try:
        from PIL import Image, ImageOps, UnidentifiedImageError
    except ImportError as exc:
        raise RuntimeError("Pillow is required for image preprocessing. Install backend/requirements.txt.") from exc
    output = PROCESSED_IMAGES_DIR
    thumbnails = output / "thumbnails"
    labels = output / "labels"
    for directory in (output, thumbnails, labels): directory.mkdir(parents=True, exist_ok=True)
    result = {"processed": 0, "corrupted_removed": 0, "thumbnails": 0, "yolo_labels": 0, "errors": []}

    for dataset, root in DATASET_PATHS.items():
        if not root.exists(): continue
        for source in root.rglob("*"):
            if not source.is_file() or source.suffix.lower() not in SUPPORTED_IMAGE_EXTENSIONS: continue
            try:
                with Image.open(source) as raw:
                    raw.verify()
                with Image.open(source) as raw:
                    image = ImageOps.exif_transpose(raw).convert("RGB")
                    image = ImageOps.fit(image, image_size, method=Image.Resampling.LANCZOS)
                    class_name = _class_name(root, source)
                    stem = f"{dataset}__{class_name}__{source.stem}"
                    target = output / f"{stem}.jpg"
                    image.save(target, "JPEG", quality=92, optimize=True)
                    thumb = image.copy(); thumb.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
                    thumb.save(thumbnails / f"{stem}.jpg", "JPEG", quality=85)
                    source_label = source.with_suffix(".txt")
                    target_label = labels / f"{stem}.txt"
                    if source_label.exists(): shutil.copy2(source_label, target_label)
                    else: target_label.touch(exist_ok=True)
                    result["processed"] += 1; result["thumbnails"] += 1; result["yolo_labels"] += 1
            except (UnidentifiedImageError, OSError, ValueError) as exc:
                # Do not delete source evidence. Quarantine corrupt files for review.
                quarantine = output / "corrupt" / dataset
                quarantine.mkdir(parents=True, exist_ok=True)
                try: shutil.move(str(source), str(quarantine / source.name))
                except OSError: pass
                result["corrupted_removed"] += 1; result["errors"].append(str(source))
                logger.error("Corrupted image quarantined: %s (%s)", source, exc)
    logger.info("Image preprocessing complete: %s", result)
    return result


if __name__ == "__main__": print(preprocess_images())
