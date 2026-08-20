from fastapi import APIRouter, HTTPException
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
async def register(user: UserCreate):

    existing_username = await User.filter(username=user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = await User.filter(email=user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = await User.create(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role,
    )

    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        role=new_user.role,
    )


@router.post("/login")
async def login(email: str, password: str):

    user = await User.get_or_none(email=email)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
        ),
    }


@router.get("/users")
async def get_users():
    return await User.all().values()
    