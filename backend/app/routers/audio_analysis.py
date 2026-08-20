from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.audio_analysis_service import analyze_audio


router = APIRouter(
    prefix="/audio-analysis",
    tags=["Audio Analysis"],
)


class AudioRequest(BaseModel):

    audio_path: str


@router.post("/predict")
def predict(
    request: AudioRequest
):

    print(
        "Received audio path:",
        request.audio_path
    )

    # Convert path to Path object
    audio_path = Path(
        request.audio_path
    )

    # Check if file exists
    if not audio_path.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                f"Audio file not found: "
                f"{request.audio_path}"
            )
        )

    try:

        # Run audio AI
        result = analyze_audio(
            str(audio_path)
        )

        print(
            "Prediction:",
            result
        )

        return {

            "success": True,

            "prediction":
                result

        }

    except Exception as e:

        print(
            "Audio analysis error:",
            str(e)
        )

        raise HTTPException(

            status_code=500,

            detail=(
                f"Audio analysis failed: "
                f"{str(e)}"
            )
        )