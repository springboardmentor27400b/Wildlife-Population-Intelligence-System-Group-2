from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.deps import get_current_user, RoleChecker
from app.core.database import get_mongo_db
from app.services.ai import audio_inference_service

router = APIRouter()

class AudioAnalyzeRequest(BaseModel):
    media_id: str

@router.post("/audio/analyze", response_model=dict)
def analyze_audio(
    payload: AudioAnalyzeRequest,
    current_user = Depends(RoleChecker(["Researcher", "Officer", "ForestDept", "Admin"])),
    mongo_db = Depends(get_mongo_db)
):
    """
    Triggers bioacoustic analysis for an uploaded audio asset.
    Loads and runs bioacoustic classification on the retrieved media bytes from GridFS.
    """
    try:
        result = audio_inference_service.run_audio_inference_pipeline(
            media_id=payload.media_id,
            mongo_db=mongo_db
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except IOError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(e)}"
        )
