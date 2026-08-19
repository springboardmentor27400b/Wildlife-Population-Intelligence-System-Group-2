import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class NotificationBase(BaseModel):
    notification_type: str
    title: str
    message: str
    severity: str
    related_species: Optional[str] = None
    related_site_id: Optional[uuid.UUID] = None
    related_device_id: Optional[str] = None
    recipient_role: Optional[str] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    is_read: bool
    is_resolved: bool
    created_at: datetime
