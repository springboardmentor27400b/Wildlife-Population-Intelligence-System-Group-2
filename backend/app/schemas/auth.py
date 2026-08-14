from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole
from app.schemas.user import UserResponse

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: UserRole = UserRole.FOREST_DEPT_OFFICER

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
