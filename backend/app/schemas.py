from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role:str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role:str

    class Config:
        from_attributes = True
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    full_name: str
    role:str
from datetime import date

class SurveyCreate(BaseModel):
    survey_name: str
    location: str
    survey_date: date
    survey_leader: str
    description: str


class SurveyResponse(SurveyCreate):
    id: int

    class Config:
        from_attributes = True
class MonitoringSiteCreate(BaseModel):
    site_name: str
    location: str
    habitat_type: str


class MonitoringSiteResponse(MonitoringSiteCreate):
    id: int

    class Config:
        from_attributes = True
from datetime import date

class ObservationCreate(BaseModel):
    species_name: str
    observation_date: date
    location: str
    observer_name: str
    count: int



class ObservationResponse(ObservationCreate):
    id: int
    image_path: Optional[str] = None
    audio_path: Optional[str] = None

    class Config:
        from_attributes = True
    