import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import SurveyStatus

class SurveyBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    status: SurveyStatus = SurveyStatus.PLANNED

class SurveyCreate(SurveyBase):
    pass

class SurveyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[SurveyStatus] = None

class SurveyResponse(SurveyBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
