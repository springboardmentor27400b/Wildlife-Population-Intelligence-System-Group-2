from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

import crud
import database
from auth import get_current_user

router = APIRouter(
    prefix="/audio-analysis",
    tags=["Audio Analysis"]
)


@router.post("/")
def upload_audio(
    file: UploadFile = File(...),
    survey_id: int = Form(...),
    audio_type: str = Form(...),
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    return crud.create_audio_analysis(
        db=db,
        file=file,
        survey_id=survey_id,
        audio_type=audio_type,
        user_id=current_user.id,
    )


@router.get("/")
def get_all_audio(
    db: Session = Depends(database.get_db),
):
    return crud.get_all_audio(db)