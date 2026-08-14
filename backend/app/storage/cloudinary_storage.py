import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from app.core.config import settings
from app.core.logging_config import logger

class CloudinaryStorage:
    def __init__(self):
        if settings.is_cloudinary_configured:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
            logger.info("Cloudinary storage configured successfully.")
        else:
            logger.warning("Cloudinary credentials missing. Cloud storage unavailable.")

    def upload_file(self, file: UploadFile, folder: str = "wildlife_system") -> dict:
        """
        Uploads a file to Cloudinary.
        Returns: dict containing secure_url and public_id.
        """
        if not settings.is_cloudinary_configured:
            raise RuntimeError("Cloudinary is not configured.")
            
        # read file contents
        content = file.file.read()
        file.file.seek(0)
        
        response = cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type="auto"
        )
        
        return {
            "file_url": response.get("secure_url"),
            "public_id": response.get("public_id"),
            "file_name": file.filename,
            "mime_type": file.content_type or "application/octet-stream"
        }
        
    def delete_file(self, public_id: str) -> bool:
        """Deletes media from Cloudinary."""
        if not settings.is_cloudinary_configured:
            return False
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            logger.error(f"Failed to delete Cloudinary file {public_id}: {str(e)}")
            return False

cloudinary_storage = CloudinaryStorage()
