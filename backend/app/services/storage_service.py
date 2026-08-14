from fastapi import UploadFile
from app.core.config import settings
from app.storage.validators import validate_file_metadata
from app.storage.cloudinary_storage import cloudinary_storage
from app.storage.local_storage import local_storage
from app.core.logging_config import logger

class StorageService:
    def upload(self, file: UploadFile) -> dict:
        """
        Validates and uploads a file to the active storage backend.
        """
        mime = file.content_type or ""
        
        # 1. Determine type & validate metadata
        if mime.startswith("image/"):
            allowed = settings.ALLOWED_IMAGE_EXTENSIONS
            file_type = "image"
        elif mime.startswith("audio/"):
            allowed = settings.ALLOWED_AUDIO_EXTENSIONS
            file_type = "audio"
        else:
            allowed = settings.ALLOWED_IMAGE_EXTENSIONS + settings.ALLOWED_AUDIO_EXTENSIONS
            file_type = "other"
            
        size, ext = validate_file_metadata(file, allowed, settings.MAX_UPLOAD_SIZE)
        
        # 2. Upload to Cloudinary or Local fallback
        if settings.is_cloudinary_configured:
            try:
                meta = cloudinary_storage.upload_file(file)
                meta["file_size"] = size
                meta["file_type"] = file_type
                logger.info(f"File uploaded to Cloudinary: {meta['file_url']}")
                return meta
            except Exception as e:
                logger.error(f"Cloudinary upload failed, falling back to local storage: {str(e)}")
                
        # Local fallback
        meta = local_storage.upload_file(file)
        meta["file_size"] = size
        meta["file_type"] = file_type
        logger.info(f"File uploaded to Local storage: {meta['file_url']}")
        return meta

    def delete(self, public_id: str, is_cloudinary: bool = True) -> bool:
        """Deletes file from active storage backend."""
        if is_cloudinary and settings.is_cloudinary_configured:
            return cloudinary_storage.delete_file(public_id)
        return local_storage.delete_file(public_id)

storage_service = StorageService()
