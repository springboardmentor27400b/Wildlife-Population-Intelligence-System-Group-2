from fastapi import APIRouter, UploadFile, File
import os
import shutil

from app.services.yamnet_service import predict_audio


router = APIRouter(
    prefix="/ai",
    tags=["AI Audio Analysis"]
)


UPLOAD_FOLDER = "uploads/audio"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/analyze-audio")
async def analyze_audio_endpoint(
    audio: UploadFile = File(...)
):

    print("ROUTER STEP 1")

    # Only use the uploaded filename, never a local
    # path sent by the client.
    filename = os.path.basename(audio.filename)

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    # Save uploaded audio to backend
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            audio.file,
            buffer
        )

    print("ROUTER STEP 2")
    print("Saved audio:", file_path)

    # Run actual AI analysis
    print("ROUTER STEP 3")

    results = predict_audio(
        file_path
    )

    print("ROUTER STEP 4")

    return results