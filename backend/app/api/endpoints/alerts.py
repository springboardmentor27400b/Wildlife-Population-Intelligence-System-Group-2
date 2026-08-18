from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.sql import User, Alert
from app.models.schemas import AlertResponse, AlertSummaryResponse
from app.services.alert_service import (
    seed_admin_alerts_if_empty,
    sync_device_alerts,
    get_role_alerts_summary
)

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    alert_type: Optional[str] = Query(None, description="Filter by alert type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns notifications and alerts for the logged in user.
    Admin receives all 5 alert categories.
    ForestDept receives 4 alert categories (Device Alerts, Habitat Degradation, Population Decline, Conservation Notifications).
    """
    seed_admin_alerts_if_empty(db)
    sync_device_alerts(db)

    user_role = str(getattr(current_user.role, "value", current_user.role))

    query = db.query(Alert)

    if user_role == "Admin":
        query = query.filter(Alert.target_role.in_(["Admin", "ALL"]))
    elif user_role == "ForestDept":
        allowed_types = ["endangered_species", "device_alert", "habitat_degradation", "population_decline", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["ForestDept", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    elif user_role == "Officer":
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["Officer", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    elif user_role == "Researcher":
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["Researcher", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    else:
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_([user_role, "ALL"]), Alert.alert_type.in_(allowed_types))

    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)

    alerts = query.order_by(desc(Alert.created_at)).offset(skip).limit(limit).all()
    return alerts


@router.get("/summary", response_model=AlertSummaryResponse)
def get_alerts_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns alert summary metrics, unread counts, and counts per allowed alert category for current user role.
    """
    user_role = str(getattr(current_user.role, "value", current_user.role))
    return get_role_alerts_summary(db, user_role)


@router.patch("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_as_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marks a single alert as read.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/mark-all-read")
def mark_all_alerts_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marks all active alerts as read for the logged in user based on role category scope.
    """
    user_role = str(getattr(current_user.role, "value", current_user.role))
    
    query = db.query(Alert)
    if user_role == "Admin":
        query = query.filter(Alert.target_role.in_(["Admin", "ALL"]))
    elif user_role == "ForestDept":
        allowed_types = ["endangered_species", "device_alert", "habitat_degradation", "population_decline", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["ForestDept", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    elif user_role == "Officer":
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["Officer", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    elif user_role == "Researcher":
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["Researcher", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    else:
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_([user_role, "ALL"]), Alert.alert_type.in_(allowed_types))

    updated = query.update({Alert.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": "All alerts marked as read", "updated_count": updated}


@router.post("/refresh")
def refresh_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Re-triggers automated alert scanning engine across all 5 categories.
    """
    seed_admin_alerts_if_empty(db)
    sync_device_alerts(db)
    summary = get_role_alerts_summary(db, current_user)
    return {"message": "Alerts refreshed successfully", "summary": summary}
