import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text, Enum, ForeignKey, func, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from app.core.database import Base

class UserRole(str, enum.Enum):
    Researcher = "Researcher"
    Officer = "Officer"
    ForestDept = "ForestDept"
    Admin = "Admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.Researcher)
    is_active = Column(Boolean, default=True)
    account_status = Column(String(50), default="Normal", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    surveys_created = relationship("Survey", back_populates="creator")
    observations = relationship("Observation", back_populates="researcher")

class MonitoringSite(Base):
    __tablename__ = "monitoring_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(Geometry("POINT", srid=4326), nullable=True)
    habitat_type = Column(String(100), nullable=False)
    protected_area = Column(String(255), nullable=True)
    area_sq_km = Column(Float, nullable=True, default=1.0)
    created_at = Column(DateTime, server_default=func.now())

    devices = relationship("Device", back_populates="site")
    observations = relationship("Observation", back_populates="site")

class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    country = Column(String(100), nullable=True, default="Tanzania")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="Active")

    creator = relationship("User", back_populates="surveys_created")
    observations = relationship("Observation", back_populates="survey")

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("monitoring_sites.id"), nullable=False)
    type = Column(String(50), nullable=False)  # CameraTrap, AudioSensor
    model_number = Column(String(100), nullable=True)
    deployment_date = Column(Date, nullable=False)
    status = Column(String(50), default="Operational")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    site = relationship("MonitoringSite", back_populates="devices")
    observations = relationship("Observation", back_populates="device")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("monitoring_sites.id"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    timestamp = Column(DateTime, server_default=func.now())
    uploaded_images = Column(JSONB, default=list)  # list of image URLs/paths
    uploaded_audio = Column(JSONB, default=list)   # list of audio URLs/paths
    observation_notes = Column(Text, nullable=True)

    survey = relationship("Survey", back_populates="observations")
    site = relationship("MonitoringSite", back_populates="observations")
    researcher = relationship("User", back_populates="observations")
    device = relationship("Device", back_populates="observations")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)  # endangered_species, population_decline, habitat_degradation, device_alert, conservation_notification
    severity = Column(String(20), nullable=False, default="HIGH")  # CRITICAL, HIGH, MEDIUM, INFO
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    target_role = Column(String(50), default="Admin", nullable=False)
    site_id = Column(Integer, ForeignKey("monitoring_sites.id"), nullable=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    details = Column(JSONB, default=dict, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    site = relationship("MonitoringSite")
    device = relationship("Device")

