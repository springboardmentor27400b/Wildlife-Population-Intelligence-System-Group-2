import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings

class LocalStorage:
    def __init__(self):
        # Resolve backend root path
        self.root_path = Path(__file__).resolve().parent.parent.parent
        self.upload_base = self.root_path / settings.UPLOAD_DIR
        
        # Create directories
        self.images_dir = self.upload_base / "images"
        self.audio_dir = self.upload_base / "audio"
        
        os.makedirs(self.images_dir, exist_ok=True)
        os.makedirs(self.audio_dir, exist_ok=True)
        
        # Create gitkeep files to maintain directory tree
        (self.images_dir / ".gitkeep").touch(exist_ok=True)
        (self.audio_dir / ".gitkeep").touch(exist_ok=True)

    def upload_file(self, file: UploadFile) -> dict:
        """
        Saves file to local disk and returns meta dict.
        """
        mime = file.content_type or ""
        if mime.startswith("image/"):
            target_dir = self.images_dir
            file_type = "image"
        elif mime.startswith("audio/"):
            target_dir = self.audio_dir
            file_type = "audio"
        else:
            target_dir = self.upload_base
            file_type = "other"
            
        # Generate unique filename to prevent collisions
        filename = file.filename or "file"
        ext = filename.split(".")[-1] if "." in filename else ""
        unique_name = f"{uuid.uuid4()}.{ext}" if ext else str(uuid.uuid4())
        
        file_path = target_dir / unique_name
        
        # Write to file system
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Standard relative URL route accessible on the local server
        relative_url = f"/static/uploads/{file_type}s/{unique_name}"
        
        return {
            "file_url": relative_url,
            "public_id": unique_name,  # use name as local identifier
            "file_name": filename,
            "mime_type": mime
        }

    def delete_file(self, file_path_str: str) -> bool:
        """Removes local file if it exists."""
        # file_path_str is often stored in public_id
        for target in [self.images_dir, self.audio_dir, self.upload_base]:
            p = target / file_path_str
            if p.exists() and p.is_file():
                p.unlink()
                return True
        return False

local_storage = LocalStorage()
