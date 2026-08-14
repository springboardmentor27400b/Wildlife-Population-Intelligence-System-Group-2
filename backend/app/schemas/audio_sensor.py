import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import DeviceStatus

class AudioSensorBase(BaseModel):
    model: str
    serial_number: str
    status: DeviceStatus = DeviceStatus.ACTIVE
    site_id: Optional[uuid.UUID] = None

class AudioSensorCreate(AudioSensorBase):
    pass

class AudioSensorUpdate(BaseModel):
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[DeviceStatus] = None
    site_id: Optional[uuid.UUID] = None

class AudioSensorResponse(AudioSensorBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
