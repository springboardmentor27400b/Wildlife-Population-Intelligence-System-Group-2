from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(
    prefix="/audio",
    tags=["Audio Upload"],
)

# Get backend root directory
BASE_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIR = BASE_DIR / "uploads" / "audio"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ALLOWED_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".flac",
    ".ogg",
}


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...)
):

    # Check filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No audio file selected."
        )

    # Get extension
    extension = Path(
        file.filename
    ).suffix.lower()

    # Check extension
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only WAV, MP3, FLAC and OGG "
                "files are allowed."
            )
        )

    # Generate unique filename
    filename = (
        f"{uuid4()}{extension}"
    )

    # Create full path
    filepath = (
        UPLOAD_DIR / filename
    )

    try:

        # Save uploaded file
        with open(
            filepath,
            "wb"
        ) as buffer:

            buffer.write(
                await file.read()
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to save audio: {str(e)}"
            )
        )

    print(
        "Audio saved at:",
        filepath
    )

    return {

        "success": True,

        "message":
            "Audio uploaded successfully",

        "filename":
            filename,

        # Return absolute path
        "path":
            str(filepath.resolve())
    }