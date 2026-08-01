from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.middleware.auth import get_current_user, require_roles
from app.models.user import User
from app.services.dataset_ingestion_service import ingest_dataset_metadata
from scripts.dataset_statistics import collect_statistics
from scripts.download_datasets import ensure_dataset_structure
from scripts.preprocess_audio import preprocess_audio
from scripts.preprocess_images import preprocess_images
from scripts.split_dataset import split_dataset
from scripts.verify_datasets import verify_datasets

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("/status")
def dataset_status(current_user: User = Depends(require_roles("wildlife_researcher", "conservation_officer", "forest_officer", "admin")), db: Session = Depends(get_db)) -> dict:
    return {"datasets": ensure_dataset_structure(), "verification": verify_datasets()}


@router.get("/statistics")
def dataset_statistics(current_user: User = Depends(require_roles("wildlife_researcher", "conservation_officer", "forest_officer", "admin")), db: Session = Depends(get_db)) -> dict:
    return collect_statistics()


@router.post("/preprocess")
def preprocess_datasets(current_user: User = Depends(require_roles("admin", "conservation_officer")), db: Session = Depends(get_db)) -> dict:
    try:
        return {"images": preprocess_images(), "audio": preprocess_audio()}
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/split")
def split_datasets(current_user: User = Depends(require_roles("admin", "conservation_officer")), db: Session = Depends(get_db)) -> dict:
    return split_dataset()


@router.post("/ingest")
def ingest_datasets(current_user: User = Depends(require_roles("admin", "conservation_officer")), db: Session = Depends(get_db)) -> dict:
    return ingest_dataset_metadata(db)
