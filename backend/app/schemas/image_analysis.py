from datetime import datetime
from pydantic import BaseModel


class ImageAnalysisCreate(BaseModel):
    image_name: str
    species: str
    confidence: str
    image_path: str
    detected_image_path: str


class ImageAnalysisOut(BaseModel):
    id: int
    image_name: str
    species: str
    confidence: str
    image_path: str
    detected_image_path: str
    upload_date: datetime

    class Config:
        orm_mode = True
