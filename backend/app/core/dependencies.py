import uuid
from typing import Generator
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Could not validate credentials: sub empty")
    except JWTError:
        raise UnauthorizedException("Could not validate credentials: JWT error")
        
    try:
        # User ID is stored as UUID in the database
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    except ValueError:
        raise UnauthorizedException("Invalid token format")
        
    if not user:
        raise UnauthorizedException("User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise UnauthorizedException("Inactive user")
    return current_user
