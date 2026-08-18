from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.deps import get_current_user
from app.models.sql import User
from app.models.schemas import UserResponse, UserProfileUpdate

router = APIRouter()

@router.get("/", response_model=UserResponse)
def read_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user from db to update
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Update fields
    if profile_in.full_name is not None:
        db_user.full_name = profile_in.full_name
        
    if profile_in.password is not None:
        db_user.hashed_password = get_password_hash(profile_in.password)
        
    db.commit()
    db.refresh(db_user)
    return db_user
