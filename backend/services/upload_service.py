import os
import shutil

from fastapi import UploadFile

from config.settings import UPLOAD_IMAGE_DIR


def upload_image_file(file: UploadFile):
    os.makedirs(UPLOAD_IMAGE_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_IMAGE_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Image uploaded successfully",
        "image_path": file_path,
    }
