from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


class WildlifeImage(Base):
    __tablename__ = "wildlife_images"

    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    image_path = Column(String(500), nullable=False)
    species = Column(String(255), nullable=True)
    scientific_name = Column(String(255), nullable=True)
    family = Column(String(100), nullable=True)
    genus = Column(String(100), nullable=True)
    habitat = Column(String(255), nullable=True)
    diet = Column(String(255), nullable=True)
    lifespan = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True)
    confidence = Column(String(50), nullable=True)
    bounding_box = Column(String(255), nullable=True)
    annotated_image_path = Column(String(500), nullable=True)
    crop_image_path = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    detection_date = Column(String(50), nullable=True)
    detection_time = Column(String(50), nullable=True)
    inference_time = Column(String(50), nullable=True)

    survey = relationship("Survey", back_populates="wildlife_images")
