from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional


class SensorLog(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    site_id: int
    device_type: str  # camera_trap | audio_sensor | environmental
    device_status: str  # active | low_battery | error
    battery_level: float
    storage_remaining_gb: float
    last_ping: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}


class WeatherReading(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    site_id: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    temperature_c: float
    humidity_pct: float
    lux: float
    rainfall_mm: float

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}


class UploadedMedia(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    filename: str
    original_filename: str
    file_type: str  # image | audio
    mime_type: str
    file_size: int
    storage_path: str
    uploaded_by: int
    survey_id: Optional[int] = None
    site_id: Optional[int] = None
    device_id: Optional[int] = None
    upload_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    upload_status: str
    gridfs_id: Optional[str] = None
    sha256_hash: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}

