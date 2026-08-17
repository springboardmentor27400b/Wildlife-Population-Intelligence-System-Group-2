from fastapi import APIRouter
import os

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats():

    image_count = 0
    audio_count = 0

    if os.path.exists("uploads/images"):
        image_count = len(os.listdir("uploads/images"))

    if os.path.exists("uploads/audio"):
        audio_count = len(os.listdir("uploads/audio"))

    return {

        "image_analysis": image_count,

        "audio_analysis": audio_count,

        "species_detected": 12,

        "average_habitat": 91,

        "biodiversity_index": 87,

        "ai_accuracy": 95

    }