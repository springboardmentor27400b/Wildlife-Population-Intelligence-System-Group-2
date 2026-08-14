from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.auth import Token, UserRegister
from app.services.auth_service import auth_service

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new user account and obtain access tokens.
    """
    user = auth_service.register_user(
        db,
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        role=user_in.role
    )
    # Automatically authenticate after registration
    auth_data = auth_service.authenticate_user(
        db,
        email=user_in.email,
        password=user_in.password
    )
    return auth_data

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Standard OAuth2 compatible token login. Use email in 'username' field.
    """
    auth_data = auth_service.authenticate_user(
        db,
        email=form_data.username,
        password=form_data.password
    )
    return auth_data
