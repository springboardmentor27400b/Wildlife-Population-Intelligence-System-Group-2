from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import BadRequestException

def validate_file_metadata(file: UploadFile, allowed_extensions: list, max_size: int):
    # Check file size if available (often file.size or content length is checked or read later)
    # To get size, we can read it or use system headers.
    # In FastAPI, we can seek to end or check from headers.
    # Let's seek to end to check size and seek back to 0.
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > max_size:
        raise BadRequestException(f"File size exceeds maximum limit of {max_size / 1024 / 1024:.1f}MB")
        
    filename = file.filename or ""
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in allowed_extensions:
        raise BadRequestException(
            f"Unsupported file format. Allowed formats: {', '.join(allowed_extensions)}"
        )
    return size, ext
