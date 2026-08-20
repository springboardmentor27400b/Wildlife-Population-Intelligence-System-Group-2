from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserRegister, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import register_user,login_user
from app.auth.dependencies import get_current_user
from app.auth.permissions import require_roles
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    new_user = register_user(db, user)

    if new_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email or Username already exists",
        )

    return new_user
@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    token = login_user(
        db,
        request.email,
        request.password,
    )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "access_token": token,
        "token_type": "bearer",
    }
@router.get(
    "/me",
    response_model=UserResponse,
)
def get_profile(
    current_user=Depends(get_current_user),
):
    return current_user
@router.get("/admin")
def admin_dashboard(
    current_user=Depends(require_roles([1])),
):
    return {
        "message": "Welcome Administrator",
        "user": current_user,
    }
@router.get("/research")
def researcher_dashboard(
    current_user=Depends(require_roles([2])),
):
    return {
        "message": "Welcome Wildlife Researcher",
        "user": current_user,
    }