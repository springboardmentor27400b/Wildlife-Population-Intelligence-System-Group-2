import logging
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.wildlife_audio import WildlifeAudio
from app.models.wildlife_image import WildlifeImage
from app.services.storage_service import save_upload

router = APIRouter(tags=["uploads"])
logger = logging.getLogger(__name__)


@router.post("/upload/image")
def upload_image(survey_id: int, file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        metadata = save_upload(file, "image")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    db.add(WildlifeImage(survey_id=survey_id, image_path=metadata["storage_path"], species="pending", confidence="pending"))
    db.commit()
    logger.info("Image upload stored", extra={"context": {"user_id": current_user.id, "storage_path": metadata["storage_path"], "survey_id": survey_id}})
    return {"message": "Image uploaded successfully", "path": metadata["storage_path"], "metadata": metadata}


@router.post("/upload/audio")
def upload_audio(survey_id: int, file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        metadata = save_upload(file, "audio")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    db.add(WildlifeAudio(survey_id=survey_id, audio_path=metadata["storage_path"], species="pending"))
    db.commit()
    logger.info("Audio upload stored", extra={"context": {"user_id": current_user.id, "storage_path": metadata["storage_path"], "survey_id": survey_id}})
    return {"message": "Audio uploaded successfully", "path": metadata["storage_path"], "metadata": metadata}
