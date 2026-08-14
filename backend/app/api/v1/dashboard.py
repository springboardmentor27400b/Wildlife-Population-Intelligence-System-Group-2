from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import dashboard_service
from app.models.user import User

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get aggregated counts and chart metrics for dashboard charts.
    """
    return dashboard_service.get_summary(db)
