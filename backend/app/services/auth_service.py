from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import ConflictException, UnauthorizedException
from app.repositories.user_repository import user_repository
from app.models.user import User
from app.models.enums import UserRole
from app.utils.validators import validate_email_format, validate_password_strength

class AuthService:
    def register_user(
        self,
        db: Session,
        *,
        email: str,
        password: str,
        full_name: str,
        role: UserRole
    ) -> User:
        # Validate inputs
        validate_email_format(email)
        validate_password_strength(password)
        
        # Check if already exists
        existing_user = user_repository.get_by_email(db, email=email)
        if existing_user:
            raise ConflictException("Email already registered")
            
        hashed_password = get_password_hash(password)
        
        # Create user database record
        # Note: We construct schema manually or map arguments to repository.
        # Create method in BaseRepository takes schema or data.
        # We can construct User directly or pass properties.
        user_obj = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role,
            is_active=True
        )
        db.add(user_obj)
        db.commit()
        db.refresh(user_obj)
        return user_obj

    def authenticate_user(
        self,
        db: Session,
        *,
        email: str,
        password: str
    ) -> dict:
        user = user_repository.get_by_email(db, email=email)
        if not user:
            raise UnauthorizedException("Incorrect email or password")
        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException("User account is disabled")
            
        # Create access token
        access_token = create_access_token(subject=str(user.id))
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

auth_service = AuthService()
