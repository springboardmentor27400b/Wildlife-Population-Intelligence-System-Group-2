from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.monitoring_site import MonitoringSite
from app.models.survey import Survey
from app.models.user import User
from app.models.image_detection import ImageDetection
from app.models.audio_detection import AudioDetection

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    site_count = db.query(MonitoringSite).count()
    survey_count = db.query(Survey).count()
    image_count = db.query(ImageDetection).count()
    audio_count = db.query(AudioDetection).count()

    return {
        "message": "Dashboard ready",
        "summary": {
            "sites": site_count,
            "surveys": survey_count,
            "images": image_count,
            "audio": audio_count,
            "user_role": current_user.role,
        },
    }
