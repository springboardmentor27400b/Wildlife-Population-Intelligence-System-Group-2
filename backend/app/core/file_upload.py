from pathlib import Path
import uuid

# Upload folder
UPLOAD_FOLDER = Path("uploads")

# Create folder automatically if it doesn't exist
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Allowed image types
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
}

# Maximum upload size (10 MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


def generate_filename(filename: str):
    extension = Path(filename).suffix.lower()

    return f"{uuid.uuid4()}{extension}"