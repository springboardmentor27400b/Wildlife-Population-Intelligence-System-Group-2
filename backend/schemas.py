from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from datetime import datetime


# ==========================
# User Schemas
# ==========================
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRoleUpdate(BaseModel):
    role: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
        
# ==========================
# Species Schemas
# ==========================
class SpeciesCreate(BaseModel):
    species_name: str
    scientific_name: str
    category: str
    population: int
    conservation_status: str
    habitat: str


class SpeciesResponse(SpeciesCreate):
    id: int
    image: str | None = None

    class Config:
        from_attributes = True




# ==========================
# Observation Schemas
# ==========================

class ObservationBase(BaseModel):
    species_id: int
    survey_id: int
    location: str

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    observation_date: Optional[date] = None
    observer_name: Optional[str] = None

    population_count: Optional[int] = 0

    image_path: Optional[str] = None
    audio_path: Optional[str] = None
    notes: Optional[str] = None


class ObservationCreate(ObservationBase):
    pass


class ObservationResponse(ObservationBase):
    id: int

    class Config:
        from_attributes = True

# -----------------------------
# Survey Schemas
# -----------------------------

class SurveyBase(BaseModel):
    survey_id: str
    title: str
    survey_date: date
    protected_area: str
    habitat_type: str
    monitoring_location: str

    gps_latitude: float | None = None
    gps_longitude: float | None = None

    monitoring_device: str | None = None
    researcher_name: str | None = None

    status: str = "Planned"

    notes: str | None = None
    
class SurveyCreate(SurveyBase):
    pass


class SurveyUpdate(SurveyBase):
    pass


class SurveyResponse(SurveyBase):
    id: int

    class Config:
        from_attributes = True

# -----------------------------
# Image Analysis Schemas
# -----------------------------


class ImageAnalysisBase(BaseModel):
    image_type: str
    survey_id: int


class ImageAnalysisCreate(ImageAnalysisBase):
    pass


class ImageAnalysisResponse(ImageAnalysisBase):
    id: int

    image_name: str
    image_path: str

    processing_status: str

    uploaded_by: int

    uploaded_at: datetime

    class Config:
        from_attributes = True

    species_detected: str | None = None

    animal_count: int

    confidence: float

    result_image: str | None = None
    analysis_report: str | None = None

# -----------------------------
# Audio Analysis Schemas
# -----------------------------
    class AudioAnalysisBase(BaseModel):
            audio_name: str
            audio_type: str
            survey_id: int


    class AudioAnalysisCreate(AudioAnalysisBase):
            pass


    class AudioAnalysisResponse(AudioAnalysisBase):
            id: int
            audio_path: str

            processing_status: str

            species_detected: Optional[str] = None

            confidence: Optional[float] = 0

            analysis_report: Optional[str] = None

            uploaded_by: int

            uploaded_at: datetime

    class Config:
                from_attributes = True

# -----------------------------
# Patrol Schemas
# -----------------------------

class PatrolCreate(BaseModel):
    patrol_name: str
    patrol_date: date
    protected_area: str
    route: Optional[str] = ""
    team_name: Optional[str] = ""
    team_members: int = 0
    status: str = "Planned"
    notes: Optional[str] = ""


class PatrolResponse(PatrolCreate):
    id: int
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# -----------------------------
# Incident Schemas
# -----------------------------

class IncidentCreate(BaseModel):
    incident_type: str
    title: str
    description: str

    protected_area: Optional[str] = ""
    location: Optional[str] = ""

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    severity: str = "MEDIUM"

    status: str = "OPEN"

    notes: Optional[str] = ""