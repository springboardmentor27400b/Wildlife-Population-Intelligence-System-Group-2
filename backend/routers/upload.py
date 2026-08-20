from fastapi import APIRouter, Depends, File, UploadFile

import models
from auth import get_current_user
from services.upload_service import upload_image_file

router = APIRouter(tags=["Uploads"])


@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    return upload_image_file(file)
