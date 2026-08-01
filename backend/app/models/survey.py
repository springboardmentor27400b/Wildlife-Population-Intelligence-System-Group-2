from datetime import date
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("monitoring_sites.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    survey_date = Column(Date, nullable=False, default=date.today)
    device = Column(String(255), nullable=False)
    remarks = Column(String(1000), nullable=True)

    site = relationship("MonitoringSite")
    user = relationship("User", back_populates="surveys")
    wildlife_images = relationship("WildlifeImage", back_populates="survey", cascade="all, delete-orphan")
    wildlife_audio = relationship("WildlifeAudio", back_populates="survey", cascade="all, delete-orphan")
