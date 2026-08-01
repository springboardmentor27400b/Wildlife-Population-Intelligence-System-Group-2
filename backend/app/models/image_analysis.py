from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.database import Base


class ImageAnalysis(Base):
    __tablename__ = "image_analysis"

    id = Column(Integer, primary_key=True, index=True)
    image_name = Column(String(255), nullable=False)
    species = Column(String(255), nullable=True)
    confidence = Column(String(50), nullable=True)
    image_path = Column(String(500), nullable=False)
    detected_image_path = Column(String(500), nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
