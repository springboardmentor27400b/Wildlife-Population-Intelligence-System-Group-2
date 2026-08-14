import uuid
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.services.prediction_service import prediction_service
from app.services.storage_service import storage_service
from app.models.media import Media

router = APIRouter()

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
def run_species_prediction(
    file: UploadFile = File(...),
    observation_id: Optional[uuid.UUID] = Query(None, description="Optional observation ID to associate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Inference endpoint: Uploads wildlife image, executes YOLOv8,
    draws bounding boxes, and logs predictions in PostgreSQL.
    """
    mime = file.content_type or ""
    if not mime.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File upload must be a valid image format."
        )
        
    # 1. Upload to storage (local or cloudinary)
    meta = storage_service.upload(file)
    
    # 2. Record media log in DB
    db_media = Media(
        id=uuid.uuid4(),
        observation_id=observation_id or uuid.uuid4(), # Fallback uuid to satisfy nullable constraint if no observation logged yet
        file_name=meta["file_name"],
        file_url=meta["file_url"],
        public_id=meta.get("public_id"),
        mime_type=file.content_type,
        file_size=meta["file_size"],
        file_type="image"
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    
    try:
        # 3. Trigger unified YOLOv8 Prediction Service
        result = prediction_service.predict(db, db_media, generate_heatmap=False)
        return result
    except Exception as e:
        db.delete(db_media)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unified inference pipeline execution failed: {str(e)}"
        )
