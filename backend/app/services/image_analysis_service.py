import shutil
from pathlib import Path
from uuid import uuid4
from typing import Optional
from app.models.image_analysis import ImageAnalysis
from app.schemas.image_analysis import ImageAnalysisCreate
from sqlalchemy.orm import Session
from app.auth.security import hash_password

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads"
IMAGE_DIR = UPLOAD_ROOT / "images"
DETECTED_DIR = IMAGE_DIR / "detected"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)
DETECTED_DIR.mkdir(parents=True, exist_ok=True)


def save_uploaded_image(file, filename: str) -> Path:
    destination = IMAGE_DIR / filename
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return destination


def detect_animals(image_path: Path) -> tuple[str, float, Path]:
    # Placeholder detection logic: return a default species and copy image to detected folder.
    detected_name = DETECTED_DIR / f"detected_{image_path.name}"
    shutil.copy(image_path, detected_name)
    # In a real implementation, replace this block with YOLOv8 detection.
    return "Unknown Species", 0.0, detected_name


def create_image_analysis(db: Session, payload: ImageAnalysisCreate) -> ImageAnalysis:
    record = ImageAnalysis(
        image_name=payload.image_name,
        species=payload.species,
        confidence=payload.confidence,
        image_path=payload.image_path,
        detected_image_path=payload.detected_image_path,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def process_uploaded_image(db: Session, image_file) -> ImageAnalysis:
    extension = Path(image_file.filename).suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png"}:
        raise ValueError("Only JPG, JPEG, and PNG image types are allowed")

    filename = f"{uuid4().hex}{extension}"
    saved_path = save_uploaded_image(image_file, filename)
    species, confidence, detected_path = detect_animals(saved_path)

    payload = ImageAnalysisCreate(
        image_name=filename,
        species=species,
        confidence=f"{confidence:.2f}",
        image_path=str(saved_path),
        detected_image_path=str(detected_path),
    )
    return create_image_analysis(db, payload)
