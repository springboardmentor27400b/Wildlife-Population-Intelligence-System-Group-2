import uuid
from pydantic import Field, BaseModel
from datetime import datetime, timezone
from typing import Optional, Dict

class Role(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role_name: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    password_hash: str
    role: str
    
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    organization: Optional[str] = None
    designation: Optional[str] = None
    
    preferences: Optional[Dict] = Field(default_factory=lambda: {
        "theme": "System",
        "language": "en",
        "notifications": True,
        "autoRefresh": 30,
        "dateFormat": "YYYY-MM-DD",
        "timeFormat": "24h"
    })
    
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

