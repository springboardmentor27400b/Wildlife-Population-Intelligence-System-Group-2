import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.media import MediaResponse, MediaCreate
from app.services.media_service import media_service
from app.models.user import User

router = APIRouter()

@router.post("", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
def create_media_log(
    media_in: MediaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Log uploaded file metadata (URL, public_id, size) linked to an observation.
    """
    return media_service.create_media(
        db,
        observation_id=media_in.observation_id,
        file_name=media_in.file_name,
        file_url=media_in.file_url,
        public_id=media_in.public_id,
        mime_type=media_in.mime_type,
        file_size=media_in.file_size,
        file_type=media_in.file_type
    )

@router.get("/observation/{observation_id}", response_model=List[MediaResponse])
def get_observation_media(
    observation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all uploaded media metadata records for an observation.
    """
    return media_service.get_by_observation(db, observation_id)

@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media_log(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Remove media log entry (requires authentication).
    """
    media_service.delete_media(db, media_id)
    return None
