from sqlalchemy import Column, Integer, String

from database import Base
from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from datetime import datetime
from sqlalchemy import Float, Text, DateTime



# ==========================
# User Table
# ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

# ==========================
# Species Table
# ==========================
class Species(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True, index=True)

    species_name = Column(String, nullable=False)

    scientific_name = Column(String, nullable=False)

    category = Column(String, nullable=False)

    population = Column(Integer, nullable=False)

    conservation_status = Column(String, nullable=False)

    habitat = Column(String, nullable=False)
    image = Column(String, nullable=True)
    
    observations = relationship("Observation", back_populates="species")
    

# ==========================
# Observation Table
# ==========================

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)

    species_id = Column(Integer, ForeignKey("species.id"))
    survey_id = Column(Integer, ForeignKey("surveys.id"))

    location = Column(String, nullable=False)

    latitude = Column(Float)

    longitude = Column(Float)

    observation_date = Column(Date)

    observer_name = Column(String)

    population_count = Column(Integer)

    image_path = Column(String)

    audio_path = Column(String)

    notes = Column(String)

    species = relationship("Species", back_populates="observations")
    survey = relationship("Survey", back_populates="observations")

# -----------------------------
# Survey Model
# -----------------------------
class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)

    survey_id = Column(String(50), unique=True, nullable=False)

    title = Column(String(200), nullable=False)

    survey_date = Column(Date, nullable=False)

    protected_area = Column(String(200), nullable=False)

    habitat_type = Column(String(100), nullable=False)

    monitoring_location = Column(String(200), nullable=False)

    gps_latitude = Column(Float)

    gps_longitude = Column(Float)

    monitoring_device = Column(String(100))

    researcher_name = Column(String(100))

    status = Column(String(50), default="Planned")

    notes = Column(Text)

    observations = relationship("Observation", back_populates="survey")

    # -----------------------------
# Wildlife Image Analysis Model
# -----------------------------

class ImageAnalysis(Base):
    __tablename__ = "image_analysis"

    id = Column(Integer, primary_key=True, index=True)

    image_name = Column(String(255), nullable=False)

    image_path = Column(String(500), nullable=False)

    image_type = Column(String(50), nullable=False)

    processing_status = Column(String(50), default="Pending")

    survey_id = Column(Integer, ForeignKey("surveys.id"))

    uploaded_by = Column(Integer, ForeignKey("users.id"))

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # AI Results
    species_detected = Column(String(255), nullable=True)
    animal_count = Column(Integer, default=0)
    confidence = Column(Float, default=0)
    result_image = Column(String(500), nullable=True)
    analysis_report = Column(String(500))

    survey = relationship("Survey")
    user = relationship("User")

#-----------------------------
# Wildlife Audio Analysis Model 
#-----------------------------

class AudioAnalysis(Base):
    __tablename__ = "audio_analysis"

    id = Column(Integer, primary_key=True, index=True)

    audio_name = Column(String(255), nullable=False)

    audio_path = Column(String(500), nullable=False)

    audio_type = Column(String(100), nullable=False)

    survey_id = Column(Integer, ForeignKey("surveys.id"))

    uploaded_by = Column(Integer, ForeignKey("users.id"))

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    processing_status = Column(String(50), default="Pending")

    # AI Results
    species_detected = Column(String(255), nullable=True)

    confidence = Column(Float, default=0)

    analysis_report = Column(Text)

    survey = relationship("Survey")

    user = relationship("User")

    # -----------------------------
    # Species classsification model
    # -----------------------------

class SpeciesClassification(Base):
    __tablename__ = "species_classification"

    id = Column(Integer, primary_key=True, index=True)

    image_name = Column(String)
    image_path = Column(String)
    annotated_image = Column(String)

    common_name = Column(String)
    scientific_name = Column(String)

    kingdom = Column(String)
    phylum = Column(String)
    class_name = Column(String)
    order = Column(String)
    family = Column(String)
    genus = Column(String)

    conservation_status = Column(String)

    confidence = Column(Float)

    description = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    #-----------------------------
    # Habitat Model
    #-----------------------------
class HabitatAnalysis(Base):
        __tablename__ = "habitat_analysis"

        id = Column(Integer, primary_key=True, index=True)

        habitat_name = Column(String)
        habitat_type = Column(String)

        vegetation_cover = Column(Float)
        degradation_level = Column(Float)

        temperature = Column(Float)
        humidity = Column(Float)
        rainfall = Column(Float)

        suitability_score = Column(Float)

        health_status = Column(String)

        created_at = Column(DateTime, default=datetime.utcnow)

    # =========================================================
    # NOTIFICATION & ALERT MODEL
    # =========================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # User who receives the notification
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    # Type of notification
    # Examples:
    # ENDANGERED_SPECIES
    # POPULATION_DECLINE
    # HABITAT_DEGRADATION
    # MONITORING_DEVICE
    # CONSERVATION
    notification_type = Column(
        String(100),
        nullable=False
    )

    # INFO / WARNING / CRITICAL
    severity = Column(
        String(20),
        default="INFO",
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    # Optional related species
    species_id = Column(
        Integer,
        ForeignKey("species.id"),
        nullable=True
    )

    # Optional related habitat
    habitat = Column(
        String(255),
        nullable=True
    )

    # Optional related survey
    survey_id = Column(
        Integer,
        ForeignKey("surveys.id"),
        nullable=True
    )

    # Read / unread status
    is_read = Column(
        Boolean,
        default=False,
        nullable=False
    )

    # Notification creation time
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships
    user = relationship(
        "User"
    )

    species = relationship(
        "Species"
    )

    survey = relationship(
        "Survey"
    )

    # =========================================================
    # PATROL MODEL
    # =========================================================

class Patrol(Base):
        __tablename__ = "patrols"

        id = Column(Integer, primary_key=True, index=True)

        patrol_name = Column(String(255), nullable=False)

        patrol_date = Column(Date, nullable=False)

        protected_area = Column(String(255), nullable=False)

        route = Column(String(500), nullable=True)

        team_name = Column(String(255), nullable=True)

        team_members = Column(Integer, default=0)

        status = Column(
            String(50),
            default="Planned",
            nullable=False
        )

        notes = Column(Text, nullable=True)

        created_by = Column(
            Integer,
            ForeignKey("users.id"),
            nullable=True
        )

        created_at = Column(
            DateTime,
            default=datetime.utcnow,
            nullable=False
        )

        user = relationship("User")


    # =========================================================
    # INCIDENT MODEL
    # =========================================================

class Incident(Base):
        __tablename__ = "incidents"

        id = Column(Integer, primary_key=True, index=True)

        incident_type = Column(
            String(100),
            nullable=False
        )

        title = Column(
            String(255),
            nullable=False
        )

        description = Column(
            Text,
            nullable=False
        )

        protected_area = Column(
            String(255),
            nullable=True
        )

        location = Column(
            String(255),
            nullable=True
        )

        latitude = Column(
            Float,
            nullable=True
        )

        longitude = Column(
            Float,
            nullable=True
        )

        severity = Column(
            String(50),
            default="MEDIUM",
            nullable=False
        )

        status = Column(
            String(50),
            default="OPEN",
            nullable=False
        )

        reported_by = Column(
            Integer,
            ForeignKey("users.id"),
            nullable=True
        )

        reported_at = Column(
            DateTime,
            default=datetime.utcnow,
            nullable=False
        )

        resolved_at = Column(
            DateTime,
            nullable=True
        )

        notes = Column(
            Text,
            nullable=True
        )

        user = relationship("User")

# =========================================================
# MONITORING SYSTEM MODEL
# =========================================================

class MonitoringSystem(Base):
    __tablename__ = "monitoring_systems"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(255),
        nullable=False
    )

    type = Column(
        String(100),
        nullable=False
    )

    location = Column(
        String(255),
        nullable=False
    )

    status = Column(
        String(50),
        default="Active",
        nullable=False
    )

    last_monitored = Column(
        Date,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )