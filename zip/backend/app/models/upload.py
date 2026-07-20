from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional

class FieldUpload(Document):
    title: str
    upload_type: str
    file_name: str
    stored_file_name: str
    file_url: str
    file_size: float
    mime_type: str
    monitoring_site_id: str
    monitoring_site_name: str
    sensor_device_id: Optional[str] = None
    sensor_device_name: Optional[str] = None
    description: Optional[str] = None
    status: str = "Pending Review"
    uploaded_by: str
    uploaded_by_name: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "field_uploads"
