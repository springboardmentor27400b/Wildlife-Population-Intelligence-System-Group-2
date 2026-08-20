from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class FieldUploadCreate(BaseModel):
    # This schema might be used if doing JSON, but typically we use Form parsing directly for creation.
    # We will define fields to match validation rules.
    pass

class FieldUploadUpdate(BaseModel):
    title: Optional[str] = None
    upload_type: Optional[str] = None
    monitoring_site_id: Optional[str] = None
    monitoring_site_name: Optional[str] = None
    sensor_device_id: Optional[str] = None
    sensor_device_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class FieldUploadResponse(BaseModel):
    id: str
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
    status: str
    uploaded_by: str
    uploaded_by_name: str
    uploaded_at: datetime
    updated_at: datetime
