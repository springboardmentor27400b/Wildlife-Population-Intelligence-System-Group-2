from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.database.database import Base

class DatasetStatistic(Base):
    __tablename__ = "dataset_statistics"

    id = Column(Integer, primary_key=True, index=True)
    dataset_path = Column(String, nullable=False, default="datasets")
    total_images = Column(Integer, default=0)
    total_audio = Column(Integer, default=0)
    species_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    corrupted_count = Column(Integer, default=0)
    dataset_size_bytes = Column(Float, default=0.0)
    dataset_size_formatted = Column(String, default="0 MB")
    average_resolution = Column(String, default="N/A")
    average_images_per_species = Column(Float, default=0.0)
    average_audio_per_species = Column(Float, default=0.0)
    status = Column(String, default="Verified")
    verification_time = Column(DateTime, default=datetime.utcnow)
    last_preprocessing_date = Column(DateTime, nullable=True)
    details_json = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
