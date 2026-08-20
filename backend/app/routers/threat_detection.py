from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.threat_detection_service import (
    get_threat_alerts,
)

router = APIRouter(
    prefix="/analytics",
    tags=["Threat Detection"],
)


@router.get("/threat-alerts")
def threat_alerts(
    db: Session = Depends(get_db)
):
    return get_threat_alerts(db)