from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
import models

from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/image-analysis",
    tags=["Image Analysis"]
)


# Upload Wildlife Image
@router.post("/", response_model=schemas.ImageAnalysisResponse)
def upload_image(
    file: UploadFile = File(...),
    survey_id: int = Form(...),
    image_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    return crud.create_image_analysis(
        db=db,
        file=file,
        survey_id=survey_id,
        image_type=image_type,
        user_id=current_user.id,
    )


# Get All Images
@router.get("/", response_model=list[schemas.ImageAnalysisResponse])
def get_images(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    return crud.get_all_images(db)


# Get Single Image
@router.get("/{image_id}", response_model=schemas.ImageAnalysisResponse)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    image = crud.get_image(db, image_id)

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return image


# Delete Image
@router.delete("/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    image = crud.delete_image(db, image_id)

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return {
        "message": "Image deleted successfully"
    }