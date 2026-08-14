import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class MediaBase(BaseModel):
    observation_id: uuid.UUID
    file_name: str
    file_url: str
    public_id: Optional[str] = None
    mime_type: str
    file_size: int
    file_type: str  # "image" or "audio"

class MediaCreate(MediaBase):
    pass

class MediaResponse(MediaBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    uploaded_at: datetime
