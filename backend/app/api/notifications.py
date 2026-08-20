from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional

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
    from app.database.db import supabase
    user_id = str(current_user.id)
    res = supabase.table("notifications").select("*").or_(f"user_id.eq.{user_id},user_id.eq.admin_all").order("created_at", desc=True).execute()
    return [Notification(**d) for d in res.data]

@router.get("/unread")
async def get_unread_notifications(
    current_user: User = Depends(get_current_user)
):
    """Get unread notifications count and list."""
    from app.database.db import supabase
    user_id = str(current_user.id)
    res = supabase.table("notifications").select("*").eq("is_read", False).or_(f"user_id.eq.{user_id},user_id.eq.admin_all").order("created_at", desc=True).execute()
    notifications = [Notification(**d) for d in res.data]
    return {
        "count": len(notifications),
        "notifications": notifications
    }

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    notification = await get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notification.user_id != str(current_user.id) and notification.user_id != "admin_all":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    notification.is_read = True
    await save(notification)
    return notification

@router.put("/bulk/read")
async def mark_selected_read(
    data: Dict[str, List[str]],
    current_user: User = Depends(get_current_user)
):
    ids = data.get("ids", [])
    for nid in ids:
        notification = await get(Notification, str(nid))
        if notification and (notification.user_id == str(current_user.id) or notification.user_id == "admin_all"):
            notification.is_read = True
            await save(notification)
    return {"status": "success"}

@router.delete("/bulk/delete")
async def delete_selected(
    data: Dict[str, List[str]],
    current_user: User = Depends(get_current_user)
):
    ids = data.get("ids", [])
    for nid in ids:
        notification = await get(Notification, str(nid))
        if notification and (notification.user_id == str(current_user.id) or notification.user_id == "admin_all"):
            await delete(notification)
    return {"status": "success"}

@router.put("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user)
):
    from app.database.db import supabase
    user_id = str(current_user.id)
    supabase.table("notifications").update({"is_read": True}).eq("is_read", False).or_(f"user_id.eq.{user_id},user_id.eq.admin_all").execute()
    return {"status": "success"}

@router.delete("/clear-all")
async def clear_all(
    current_user: User = Depends(get_current_user)
):
    from app.database.db import supabase
    user_id = str(current_user.id)
    supabase.table("notifications").delete().or_(f"user_id.eq.{user_id},user_id.eq.admin_all").execute()
    return {"status": "success"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    notification = await get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notification.user_id != str(current_user.id) and notification.user_id != "admin_all":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await delete(notification)
    return {"status": "success"}
