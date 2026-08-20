from datetime import datetime
from typing import List

from beanie import Document
from pydantic import BaseModel, Field


class Detection(BaseModel):
    species: str
    confidence: float
    behavior: str = "Unknown"
    behavior_confidence: float = 0.0


class ImageUpload(Document):
    filename: str
    filepath: str

    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    status: str = "Uploaded"
    analysis_status: str = "Pending"

    detections: List[Detection] = Field(default_factory=list)

    animal_count: int = 0

    class Settings:
        name = "uploaded_images"