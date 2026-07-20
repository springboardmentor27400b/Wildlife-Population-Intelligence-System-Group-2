from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from beanie import PydanticObjectId
from app.models.notification import Notification
from app.models.user import User
from app.api.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter()

@router.get("/")
async def get_notifications(
    current_user: User = Depends(get_current_user)
):
    """Get all notifications for the current user and broadcasts."""
    user_id = str(current_user.id)
    notifications = await Notification.find(
        {"$or": [{"user_id": user_id}, {"user_id": "admin_all"}]}
    ).sort("-created_at").to_list()
    return notifications

@router.get("/unread")
async def get_unread_notifications(
    current_user: User = Depends(get_current_user)
):
    """Get unread notifications count and list."""
    user_id = str(current_user.id)
    notifications = await Notification.find(
        {"$or": [{"user_id": user_id}, {"user_id": "admin_all"}], "is_read": False}
    ).sort("-created_at").to_list()
    return {
        "count": len(notifications),
        "notifications": notifications
    }

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notification.user_id != str(current_user.id) and notification.user_id != "admin_all":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    notification.is_read = True
    await notification.save()
    return notification

@router.put("/bulk/read")
async def mark_selected_read(
    data: Dict[str, List[str]],
    current_user: User = Depends(get_current_user)
):
    ids = data.get("ids", [])
    for nid in ids:
        notification = await Notification.get(PydanticObjectId(nid))
        if notification and (notification.user_id == str(current_user.id) or notification.user_id == "admin_all"):
            notification.is_read = True
            await notification.save()
    return {"status": "success"}

@router.delete("/bulk/delete")
async def delete_selected(
    data: Dict[str, List[str]],
    current_user: User = Depends(get_current_user)
):
    ids = data.get("ids", [])
    for nid in ids:
        notification = await Notification.get(PydanticObjectId(nid))
        if notification and (notification.user_id == str(current_user.id) or notification.user_id == "admin_all"):
            await notification.delete()
    return {"status": "success"}

@router.put("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user)
):
    user_id = str(current_user.id)
    await Notification.find(
        {"$or": [{"user_id": user_id}, {"user_id": "admin_all"}], "is_read": False}
    ).update({"$set": {"is_read": True}})
    
    return {"status": "success"}

@router.delete("/clear-all")
async def clear_all(
    current_user: User = Depends(get_current_user)
):
    user_id = str(current_user.id)
    await Notification.find(
        {"$or": [{"user_id": user_id}, {"user_id": "admin_all"}]}
    ).delete()
    
    return {"status": "success"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notification.user_id != str(current_user.id) and notification.user_id != "admin_all":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await notification.delete()
    return {"status": "success"}
