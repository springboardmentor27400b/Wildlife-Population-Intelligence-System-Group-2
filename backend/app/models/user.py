from beanie import Document
from pydantic import Field, BaseModel
from datetime import datetime, timezone
from typing import Optional, Dict

class Role(Document):
    role_name: str

    class Settings:
        name = "roles"

class User(Document):
    full_name: str
    email: str
    password_hash: str
    role: str
    
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    organization: Optional[str] = None
    designation: Optional[str] = None
    
    preferences: Dict = Field(default_factory=lambda: {
        "theme": "System",
        "language": "en",
        "notifications": True,
        "autoRefresh": 30,
        "dateFormat": "YYYY-MM-DD",
        "timeFormat": "24h"
    })
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
