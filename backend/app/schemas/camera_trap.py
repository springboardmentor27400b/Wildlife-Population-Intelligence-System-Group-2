import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import DeviceStatus

class CameraTrapBase(BaseModel):
    model: str
    serial_number: str
    status: DeviceStatus = DeviceStatus.ACTIVE
    site_id: Optional[uuid.UUID] = None

class CameraTrapCreate(CameraTrapBase):
    pass

class CameraTrapUpdate(BaseModel):
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[DeviceStatus] = None
    site_id: Optional[uuid.UUID] = None

class CameraTrapResponse(CameraTrapBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
