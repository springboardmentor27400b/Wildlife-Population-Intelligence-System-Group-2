from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class AudioDetection(Base):
    __tablename__ = "audio_detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    audio_path = Column(String(500), nullable=False)
    species = Column(String(255), nullable=True)
    scientific_name = Column(String(255), nullable=True)
    family = Column(String(100), nullable=True)
    genus = Column(String(100), nullable=True)
    habitat = Column(String(255), nullable=True)
    diet = Column(String(255), nullable=True)
    lifespan = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True)
    confidence = Column(String(50), nullable=True)
    waveform_path = Column(String(500), nullable=True)
    spectrogram_path = Column(String(500), nullable=True)
    thumbnail_path = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    detection_date = Column(String(50), nullable=True)
    detection_time = Column(String(50), nullable=True)
    inference_time = Column(String(50), nullable=True)
    
    # Audio-specific analytics
    duration = Column(String(50), nullable=True)
    sample_rate = Column(String(50), nullable=True)
    frequency = Column(String(50), nullable=True)
    dominant_frequency = Column(String(50), nullable=True)
    mfcc_mean = Column(String(50), nullable=True)
    spectral_centroid = Column(String(50), nullable=True)
    zero_crossing_rate = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audio_detections")
