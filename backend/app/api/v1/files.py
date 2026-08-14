from fastapi import APIRouter, Depends, UploadFile, File
from app.api.deps import get_current_active_user
from app.services.storage_service import storage_service
from app.models.user import User

router = APIRouter()

@router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload file (image or audio) to active storage.
    Returns: file URL, public ID, size, type, and name.
    """
    meta = storage_service.upload(file)
    return meta
