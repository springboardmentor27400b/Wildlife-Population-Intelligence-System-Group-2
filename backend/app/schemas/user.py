from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, Dict, Any

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[str] = None
    role_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserRead(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    organization: Optional[str] = None
    designation: Optional[str] = None
    preferences: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    organization: Optional[str] = None
    designation: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    preferences: Dict[str, Any]

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

class TokenData(BaseModel):
    email: str | None = None

class GoogleToken(BaseModel):
    token: str
