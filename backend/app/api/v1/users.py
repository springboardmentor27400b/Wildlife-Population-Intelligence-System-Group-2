from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import user_service
from app.models.user import User

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
