from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    role_id: int


class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: EmailStr
    role_id: int
    is_active: bool

    class Config:
        from_attributes = True