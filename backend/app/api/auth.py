from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User, Role
from app.models.notification import Notification
from app.schemas.user import UserCreate, UserRead, Token, UserUpdate, PasswordChange, GoogleToken, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from app.middleware.auth import get_current_user
from app.utils.logger import logger
from app.utils.audit import create_audit_log
from datetime import datetime, timezone
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import secrets
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, request: Request):
    existing_user = await find_one(User, "email", user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account already exists with this email. Please sign in instead.",
        )
    
    role_val = user_in.role or user_in.role_id
    if not role_val:
        raise HTTPException(status_code=400, detail="Please select your role to continue.")
        
    role = await find_one(Role, "role_name", role_val)
    if not role:
        try:
            
            role = await get(Role, str(role_val))
        except:
            pass
            
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=role.role_name
    )
    await insert(user)
    
    notif = Notification(
        title="New User Registered",
        message=f"User {user.full_name} ({user.email}) has registered as {user.role}.",
        type="info",
        priority="Info",
        user_id="admin_all"
    )
    await insert(notif)
    
    logger.info("User registered", email=user.email)
    create_audit_log(user=user, request=request, action="REGISTER", module="Auth", description=f"User {user.email} registered", severity="SUCCESS")
    return user

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, request: Request):
    logger.info("LOGIN ENDPOINT HIT")
    logger.info(f"Attempting login for email: {login_data.email}")
    
    user = await find_one(User, "email", login_data.email)
    logger.info(f"User found: {bool(user)}")
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    password_valid = verify_password(login_data.password, user.password_hash)
    logger.info(f"Password verification succeeded: {password_valid}")
    
    if not password_valid:
        create_audit_log(user=user, request=request, action="LOGIN_FAILED", module="Auth", description=f"Failed login attempt for {user.email}", status="Failed", severity="ERROR")
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    access_token = create_access_token(subject=user.email)
    logger.info("User logged in successfully", email=user.email)
    create_audit_log(user=user, request=request, action="LOGIN", module="Auth", description=f"User {user.email} logged in", severity="INFO")
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/google", response_model=Token)
async def google_login(token_data: GoogleToken):
    try:
        # Use Client ID from settings
        client_id = settings.GOOGLE_CLIENT_ID
        
        # In a real environment with a real client_id, we verify the token.
        # For testing UI before the client ID is ready, we'll allow passing 
        # a mocked email if it looks like a test payload, or we'll just try to verify.
        try:
            idinfo = id_token.verify_oauth2_token(
                token_data.token, google_requests.Request(), client_id, clock_skew_in_seconds=60
            )
            email = idinfo.get("email")
            full_name = idinfo.get("name", "")
        except ValueError as e:
            # If token verification fails, we throw an error (unless we implement a mock bypass)
            logger.error(f"Google token validation failed: {str(e)}")
            raise HTTPException(status_code=401, detail="Google authentication failed. Please choose a valid Google account and try again.")
            
        if not email:
            raise HTTPException(status_code=400, detail="Google token has no email")

        user = await find_one(User, "email", email)
        if not user:
            # Create a new user with a random password
            role = await find_one(Role, "role_name", "user")
            user = User(
                full_name=full_name or email.split('@')[0],
                email=email,
                password_hash=get_password_hash(secrets.token_urlsafe(32)),
                role="Wildlife Researcher"
            )
            await insert(user)
            logger.info("New user registered via Google", email=user.email)

        access_token = create_access_token(subject=user.email)
        logger.info("User logged in via Google", email=user.email)
        return {"access_token": access_token, "token_type": "bearer", "user": user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during Google login")


def require_admin(current_user: User = Depends(get_current_user)):
    role_name = current_user.role.name.lower() if hasattr(current_user.role, 'name') else str(getattr(current_user, 'role', '')).lower()
    if role_name != "administrator":
        raise HTTPException(status_code=403, detail="Not authorized. Admins only.")
    return current_user

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserRead)
async def update_profile(user_in: UserUpdate, current_user: User = Depends(get_current_user)):
    if user_in.full_name:
        current_user.full_name = user_in.full_name
    if user_in.email and user_in.email != current_user.email:
        existing = await find_one(User, "email", user_in.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_in.email
    current_user.updated_at = datetime.now(timezone.utc)
    await save(current_user)
    logger.info("User updated profile", email=current_user.email)
    return current_user

@router.put("/change-password")
async def change_password(passwords: PasswordChange, request: Request, current_user: User = Depends(get_current_user)):
    if not verify_password(passwords.old_password, current_user.password_hash):
        create_audit_log(user=current_user, request=request, action="PASSWORD_CHANGE_FAILED", module="Auth", description="Failed password change attempt", status="Failed", severity="WARNING")
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.password_hash = get_password_hash(passwords.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    await save(current_user)
    logger.info("User changed password", email=current_user.email)
    create_audit_log(user=current_user, request=request, action="PASSWORD_CHANGED", module="Auth", description="User changed password", severity="SUCCESS")
    return {"msg": "Password updated successfully"}
