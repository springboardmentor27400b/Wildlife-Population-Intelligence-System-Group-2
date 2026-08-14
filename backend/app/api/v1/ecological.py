import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.ecological import EcologicalReportResponse
from app.services.ecological_service import ecological_service

router = APIRouter()

@router.get("", response_model=EcologicalReportResponse)
def get_ecological_analysis(
    site_id: Optional[uuid.UUID] = Query(None, description="Filter report by monitoring site"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves the system-wide or site-specific AI ecological report.
    """
    return ecological_service.generate_report(db, site_id=site_id)
