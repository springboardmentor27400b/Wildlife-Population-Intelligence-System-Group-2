from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.models.user import User
from app.schemas.user import UserRead, UserProfileUpdate, UserPreferencesUpdate, PasswordChange
from app.api.auth import get_current_user
from app.core.security import verify_password, get_password_hash
from app.utils.audit import create_audit_log
from datetime import datetime, timezone

router = APIRouter()

@router.get("/profile", response_model=UserRead)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's full profile."""
    return current_user

@router.put("/profile", response_model=UserRead)
async def update_profile(
    profile_data: UserProfileUpdate,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Update user's profile information."""
    update_data = profile_data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()
    
    create_audit_log(user=current_user, request=request, action="UPDATE_PROFILE", module="Settings", description="User updated profile details", severity="INFO")
    return current_user

@router.get("/preferences")
async def get_preferences(current_user: User = Depends(get_current_user)):
    """Get user preferences."""
    return current_user.preferences

@router.put("/preferences")
async def update_preferences(
    prefs_data: UserPreferencesUpdate,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Update user preferences."""
    current_user.preferences.update(prefs_data.preferences)
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()
    
    create_audit_log(user=current_user, request=request, action="UPDATE_PREFERENCES", module="Settings", description="User updated settings preferences", severity="INFO")
    return current_user.preferences

@router.put("/password")
async def change_password(
    password_data: PasswordChange,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Change user password securely."""
    if not verify_password(password_data.old_password, current_user.password_hash):
        create_audit_log(user=current_user, request=request, action="PASSWORD_CHANGE_FAILED", module="Settings", description="Failed password change attempt", status="Failed", severity="WARNING")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
        
    current_user.password_hash = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()
    
    create_audit_log(user=current_user, request=request, action="PASSWORD_CHANGED", module="Settings", description="User changed their password", severity="SUCCESS")
    return {"message": "Password updated successfully"}
