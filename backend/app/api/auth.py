from fastapi import APIRouter, HTTPException
from app.models.user import User
from app.utils.security import hash_password,verify_password
from app.schemas.user import UserCreate, UserResponse, UserLogin
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
@router.post("/register")
async def register(user: UserCreate):

    # Check if username already exists
    existing_username = await User.filter(username=user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")
    # Check if email already exists
    existing_email = await User.filter(email=user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    # Save user
    new_user = await User.create(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role
    )
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        role=new_user.role
    )
@router.post("/login")
async def login(user: UserLogin):

    db_user = await User.get_or_none(email=user.email)

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        role=db_user.role
    )