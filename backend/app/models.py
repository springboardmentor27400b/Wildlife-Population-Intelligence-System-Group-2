from sqlalchemy import Column, Integer, String, Date, Text,Float
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="Researcher")
class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    survey_name = Column(String(100))
    location = Column(String(100))
    survey_date = Column(Date)
    survey_leader = Column(String(100))
    description = Column(Text)


class MonitoringSite(Base):
    __tablename__ = "monitoring_sites"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String(100))
    location = Column(String(100))
    habitat_type = Column(String(100))
    area_km2 = Column(Integer, default=1)

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    species_name = Column(String(100))
    observation_date = Column(Date)
    location = Column(String(100))
    observer_name = Column(String(100))
    count = Column(Integer)

    
    image_path = Column(String(255), nullable=True)
    audio_path = Column(String(255), nullable=True)
    