import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    action: str
    module: str
    entity_id: Optional[str] = None
    entity_type: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[dict] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.utcnow())

