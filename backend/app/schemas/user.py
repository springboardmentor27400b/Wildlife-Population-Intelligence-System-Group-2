from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "wildlife_researcher"

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters")
        return value


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
