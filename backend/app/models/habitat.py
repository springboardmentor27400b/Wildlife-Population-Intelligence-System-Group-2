from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, func
from app.database.database import Base

class HabitatAnalytics(Base):
    __tablename__ = "habitat_analytics"

    id = Column(Integer, primary_key=True, index=True)
    habitat_name = Column(String(255), nullable=False)
    habitat_quality = Column(Float, nullable=True)
    vegetation_score = Column(Float, nullable=True)
    water_score = Column(Float, nullable=True)
    food_availability = Column(Float, nullable=True)
    human_disturbance = Column(Float, nullable=True)
    biodiversity_index = Column(Float, nullable=True)
    climate_score = Column(Float, nullable=True)
    carrying_capacity = Column(Integer, nullable=True)
    habitat_health = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=True) # Excellent, Good, Moderate, Poor, Critical
    recommendation = Column(String(1000), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class HabitatAnalysis(Base):
    __tablename__ = "habitat_analyses"

    id = Column(Integer, primary_key=True, index=True)
    habitat_name = Column(String(255), nullable=False)
    region = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    suitability_score = Column(Float, nullable=True)
    water_availability = Column(Float, nullable=True)
    vegetation_density = Column(Float, nullable=True)
    temperature_celsius = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    food_availability = Column(Float, nullable=True)
    pollution_index = Column(Float, nullable=True)
    fire_risk = Column(Float, nullable=True)
    habitat_quality = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    human_disturbance = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)
    degradation_level = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=True)
    species_count = Column(Integer, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area_km2 = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class HabitatRisk(Base):
    __tablename__ = "habitat_risks"

    id = Column(Integer, primary_key=True, index=True)
    habitat_name = Column(String(255), nullable=False)
    risk_category = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False)
    primary_threat = Column(String(255), nullable=True)
    affected_species = Column(String(255), nullable=True)
    description = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MigrationCorridor(Base):
    __tablename__ = "migration_corridors"

    id = Column(Integer, primary_key=True, index=True)
    corridor_name = Column(String(255), nullable=False)
    from_habitat = Column(String(255), nullable=False)
    to_habitat = Column(String(255), nullable=False)
    species = Column(String(255), nullable=False)
    distance_km = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
