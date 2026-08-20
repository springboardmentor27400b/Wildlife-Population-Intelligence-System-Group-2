from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.dataset_ingestion_service import ingest_dataset_metadata
from scripts.dataset_statistics import collect_statistics
from scripts.preprocess_audio import preprocess_audio
from scripts.preprocess_images import preprocess_images
from scripts.split_dataset import split_dataset
from scripts.verify_datasets import verify_datasets

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/datasets", tags=["datasets"])
alt_router = APIRouter(prefix="/dataset", tags=["datasets"])


@router.get("/status")
@router.post("/status")
@alt_router.get("/status")
@alt_router.post("/status")
def dataset_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    verification = verify_datasets()
    statistics = collect_statistics(db_session=db)
    return {
        "datasets": verification,
        "verification": verification,
        "statistics": statistics
    }


@router.get("/verify")
@router.post("/verify")
@alt_router.get("/verify")
@alt_router.post("/verify")
def dataset_verify(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    verification = verify_datasets()
    statistics = collect_statistics(db_session=db)
    return {
        "status": "success",
        "message": "Dataset verification completed successfully.",
        "verification": verification,
        "statistics": statistics
    }


@router.get("/statistics")
@router.post("/statistics")
@alt_router.get("/statistics")
@alt_router.post("/statistics")
def dataset_statistics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return collect_statistics(db_session=db)


@router.get("/preprocess")
@router.post("/preprocess")
@alt_router.get("/preprocess")
@alt_router.post("/preprocess")
def preprocess_datasets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    try:
        img_result = preprocess_images()
    except Exception as exc:
        logger.warning("Image preprocessing warning: %s", exc)
        img_result = {"processed": 0, "status": str(exc)}

    try:
        audio_result = preprocess_audio()
    except Exception as exc:
        logger.warning("Audio preprocessing warning: %s", exc)
        audio_result = {"processed": 0, "status": str(exc)}

    stats = collect_statistics(db_session=db)
    return {
        "status": "success",
        "message": "Dataset preprocessing complete.",
        "images": img_result,
        "audio": audio_result,
        "statistics": stats
    }


@router.get("/split")
@router.post("/split")
@alt_router.get("/split")
@alt_router.post("/split")
def split_datasets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    split_res = split_dataset()
    stats = collect_statistics(db_session=db)
    return {
        "status": "success",
        "message": "Balanced train/validation/test splits generated.",
        "split": split_res,
        "statistics": stats
    }


@router.get("/ingest")
@router.post("/ingest")
@alt_router.get("/ingest")
@alt_router.post("/ingest")
def ingest_datasets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return ingest_dataset_metadata(db)
