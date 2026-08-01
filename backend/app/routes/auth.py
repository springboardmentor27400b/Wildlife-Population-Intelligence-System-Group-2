from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.security import create_access_token, hash_password, verify_password
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import ProfileUpdate, TokenResponse, UserCreate, UserLogin, UserOut
from app.middleware.auth import get_current_user

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user.id, full_name=user.full_name, email=user.email, role=user.role, created_at=user.created_at),
    )


import logging
import traceback

logger = logging.getLogger(__name__)


@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    logger.info("Login attempt for email: %s", user_data.email)
    try:
        user = db.query(User).filter(User.email == user_data.email).first()
        if not user:
            logger.warning("Login failed: User not found (%s)", user_data.email)
            raise HTTPException(status_code=404, detail="User not found")

        if not user.password_hash:
            logger.warning("Login failed: Password hash missing for user (%s)", user_data.email)
            raise HTTPException(status_code=401, detail="Invalid email or password")

        try:
            password_valid = verify_password(user_data.password, user.password_hash)
        except Exception as exc:
            logger.error("Password verification error: %s", exc)
            password_valid = False

        if not password_valid:
            logger.warning("Login failed: Invalid password for user (%s)", user_data.email)
            raise HTTPException(status_code=401, detail="Invalid password")

        token = create_access_token({
            "sub": user.email,
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        })
        
        logger.info("Login successful for user %s (ID: %s, Role: %s)", user.email, user.id, user.role)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserOut(id=user.id, full_name=user.full_name, email=user.email, role=user.role, created_at=user.created_at),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Unexpected 500 server error during login: %s\n%s", exc, traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {exc}")


@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(id=current_user.id, full_name=current_user.full_name, email=current_user.email, role=current_user.role, created_at=current_user.created_at)


@router.put("/profile", response_model=UserOut)
def update_profile(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.role is not None:
        current_user.role = profile_data.role
    db.commit()
    return UserOut(id=current_user.id, full_name=current_user.full_name, email=current_user.email, role=current_user.role, created_at=current_user.created_at)


@router.post("/logout")
def logout() -> dict:
    return {"message": "Logged out successfully"}
