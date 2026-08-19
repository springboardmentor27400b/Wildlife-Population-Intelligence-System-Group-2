from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.user import UserResponse, UserUpdate, UserAdminUpdate
from app.services.user_service import user_service
from app.models.user import User
from app.auth.guards import PermissionGuard
from app.auth.permissions import PERM_USER_MANAGE
from app.repositories.user_repository import user_repository

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get profile details of the currently logged-in user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details (name, email) of the logged-in user.
    """
    updated_user = user_service.update_user_profile(
        db,
        user_id=str(current_user.id),
        full_name=user_in.full_name,
        email=user_in.email
    )
    return updated_user

@router.get("", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_USER_MANAGE))
):
    """
    List all platform users (Administrator only).
    """
    return db.query(User).all()

@router.put("/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: uuid.UUID,
    user_in: UserAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_USER_MANAGE))
):
    """
    Update a user's role (Administrator only).
    """
    user = user_repository.get(db, user_id)
    if not user:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("User not found")
        
    if user.id == current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("Administrator cannot modify their own administrative role.")
        
    return user_repository.update(db, db_obj=user, obj_in={"role": user_in.role})

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_USER_MANAGE))
):
    """
    Delete a user from the platform (Administrator only).
    """
    user = user_repository.get(db, user_id)
    if not user:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("User not found")
        
    if user.id == current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("Administrator cannot delete their own profile.")
        
    user_repository.remove(db, id=user_id)
    return None
