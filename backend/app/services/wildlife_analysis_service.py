from pathlib import Path
import tempfile

from app.ai.image_ai import detect_animals
from app.ai.species_classifier import classify_species


def analyze_wildlife_image(image_path: str):
    """
    Detect animals in an image and classify each detected animal.

    YOLO provides the bounding boxes.
    The trained EfficientNet species classifier determines
    the wildlife species for each detected animal.
    """

    image_file = Path(image_path)

    if not image_file.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    detections = detect_animals(
        str(image_file)
    )

    animals = []

    # We need PIL for cropping the detected animals.
    from PIL import Image

    image = Image.open(image_file).convert("RGB")

    image_width, image_height = image.size

    for animal_id, detection in enumerate(
        detections,
        start=1,
    ):

        bbox = detection["bbox"]

        x1 = max(
            0,
            int(bbox[0]),
        )

        y1 = max(
            0,
            int(bbox[1]),
        )

        x2 = min(
            image_width,
            int(bbox[2]),
        )

        y2 = min(
            image_height,
            int(bbox[3]),
        )

        if x2 <= x1 or y2 <= y1:
            continue

        crop = image.crop(
            (x1, y1, x2, y2)
        )

        with tempfile.NamedTemporaryFile(
            suffix=".jpg",
            delete=False,
        ) as temp_file:

            crop_path = temp_file.name

        try:

            crop.save(
                crop_path,
                format="JPEG",
            )

            classification = classify_species(
                crop_path
            )

        finally:

            Path(crop_path).unlink(
                missing_ok=True
            )

        animals.append({
            "animal_id": animal_id,

            "detector_species":
                detection["species"],

            "detector_confidence":
                detection["confidence"],

            "species":
                classification["species"],

            "confidence":
                classification["confidence"],

            "predictions":
                classification["predictions"],

            "bbox": [
                x1,
                y1,
                x2,
                y2,
            ],
        })

    return {
        "animal_count": len(animals),
        "animals": animals,
    }