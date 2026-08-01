from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.image_analysis_service import process_uploaded_image
from app.schemas.image_analysis import ImageAnalysisOut

router = APIRouter(tags=["image-analysis"])


@router.post("/upload-image", response_model=ImageAnalysisOut)
def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ImageAnalysisOut:
    try:
        result = process_uploaded_image(db, file)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to process image")
