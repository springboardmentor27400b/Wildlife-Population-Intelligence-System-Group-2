import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import notification_service

router = APIRouter()
logger = logging.getLogger("wildlife_system")

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    is_read: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get dynamic, role-filtered notifications feed.
    """
    return notification_service.get_notifications(
        db,
        role=current_user.role,
        is_read=is_read,
        limit=limit,
        offset=offset
    )

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as read.
    """
    notif = notification_service.mark_as_read(db, notification_id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification log not found."
        )
    return notif

@router.put("/{notification_id}/unread", response_model=NotificationResponse)
def mark_notification_as_unread(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as unread.
    """
    notif = notification_service.mark_as_unread(db, notification_id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification log not found."
        )
    return notif

@router.put("/read-all", response_model=dict)
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark all unread notifications matching user role as read.
    """
    count = notification_service.mark_all_as_read(db, current_user.role)
    return {
        "message": "All notifications marked as read.",
        "count": count
    }

@router.put("/{notification_id}/resolve", response_model=NotificationResponse)
def mark_notification_as_resolved(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as resolved.
    """
    notif = notification_service.mark_as_resolved(db, notification_id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification log not found."
        )
    return notif

@router.delete("/{notification_id}", response_model=dict)
def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific notification log.
    """
    success = notification_service.delete_notification(db, notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification log not found."
        )
    return {"message": "Notification log deleted successfully."}
