from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List
from app.models.sql import UserRole

# Authentication & User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: UserRole = UserRole.Researcher

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    account_status: Optional[str] = "Normal"
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)


# Monitoring Site Schemas
class MonitoringSiteCreate(BaseModel):
    name: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    habitat_type: str
    protected_area: Optional[str] = None
    area_sq_km: Optional[float] = Field(default=1.0, ge=0.0)

class MonitoringSiteUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    habitat_type: Optional[str] = None
    protected_area: Optional[str] = None
    area_sq_km: Optional[float] = Field(None, ge=0.0)

class MonitoringSiteResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    habitat_type: str
    protected_area: Optional[str] = None
    area_sq_km: Optional[float] = 1.0
    created_at: datetime

    class Config:
        from_attributes = True


# Survey Schemas
class SurveyCreate(BaseModel):
    title: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    country: Optional[str] = "Tanzania"
    status: Optional[str] = "Active"

class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None

class SurveyResponse(BaseModel):
    id: int
    title: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    country: Optional[str] = "Tanzania"
    created_by: int
    status: str

    class Config:
        from_attributes = True


# Device Schemas
class DeviceCreate(BaseModel):
    site_id: int
    type: str  # CameraTrap, AudioSensor
    model_number: Optional[str] = None
    deployment_date: date
    status: Optional[str] = "Operational"

class DeviceUpdate(BaseModel):
    site_id: Optional[int] = None
    type: Optional[str] = None
    model_number: Optional[str] = None
    deployment_date: Optional[date] = None
    status: Optional[str] = None

class DeviceResponse(BaseModel):
    id: int
    site_id: int
    type: str
    model_number: Optional[str] = None
    deployment_date: date
    status: str

    class Config:
        from_attributes = True


# Observation Schemas
class ObservationCreate(BaseModel):
    survey_id: int
    site_id: int
    device_id: Optional[int] = None
    uploaded_images: Optional[List[str]] = Field(default_factory=list)
    uploaded_audio: Optional[List[str]] = Field(default_factory=list)
    observation_notes: Optional[str] = None

class ObservationResponse(BaseModel):
    id: int
    survey_id: int
    site_id: int
    researcher_id: int
    device_id: Optional[int] = None
    timestamp: datetime
    uploaded_images: List[str]
    uploaded_audio: List[str]
    observation_notes: Optional[str] = None

    class Config:
        from_attributes = True


# Alert & Notification Schemas
class AlertCreate(BaseModel):
    alert_type: str  # endangered_species, population_decline, habitat_degradation, device_alert, conservation_notification
    severity: str = "HIGH"  # CRITICAL, HIGH, MEDIUM, INFO
    title: str
    message: str
    target_role: str = "Admin"
    site_id: Optional[int] = None
    device_id: Optional[int] = None
    details: Optional[dict] = None

class AlertResponse(BaseModel):
    id: int
    alert_type: str
    severity: str
    title: str
    message: str
    target_role: str
    site_id: Optional[int] = None
    device_id: Optional[int] = None
    is_read: bool
    details: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertSummaryResponse(BaseModel):
    unread_total: int
    total: int
    counts_by_type: dict
    counts_by_severity: dict

