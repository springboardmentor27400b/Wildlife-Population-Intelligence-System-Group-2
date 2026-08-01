from datetime import date
from pydantic import BaseModel


class SurveyCreate(BaseModel):
    site_id: int
    survey_date: date
    device: str
    remarks: str | None = None


class SurveyOut(BaseModel):
    id: int
    site_id: int
    user_id: int
    survey_date: date
    device: str
    remarks: str | None = None
