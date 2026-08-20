import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    type: str  # observation, prediction, report, site, sensor, alert, info
    priority: str  # High, Medium, Low, Success
    user_id: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None

