from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ai.detector import analyze_image
from ai.species_classifier import classify_species
from sqlalchemy.orm import Session
from fastapi import Depends

from database import get_db

import crud

router = APIRouter(
    prefix="/species-classification",
    tags=["Species Classification"]
)


@router.post("/")
def classify(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Create upload folder
    upload_folder = "uploads/species"
    os.makedirs(upload_folder, exist_ok=True)

    # Save uploaded image
    file_path = os.path.join(upload_folder, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Step 1: YOLO Detection
    yolo_result = analyze_image(file_path)

    # Step 2: Species Classification
    result = classify_species(yolo_result)

    # Step 3: Add image paths
    result["uploaded_image"] = "/" + file_path.replace("\\", "/")
    result["annotated_image"] = "/" + yolo_result["annotated_image"].replace("\\", "/")
    result["image_name"] = file.filename

    # Save into database
    crud.create_species_classification(db, result)

    # Return JSON
    return result

