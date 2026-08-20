from sqlalchemy import Column, Integer, String, Float, DateTime, Date, func
from app.database.database import Base

class EcosystemHealth(Base):
    __tablename__ = "ecosystem_healths"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String(50), nullable=True)
    recorded_date = Column(Date, nullable=True)
    biodiversity_score = Column(Float, nullable=True)
    biodiversity_index = Column(Float, nullable=True)
    ecosystem_score = Column(Float, nullable=True)
    habitat_score = Column(Float, nullable=True)
    conservation_score = Column(Float, nullable=True)
    water_quality = Column(Float, nullable=True)
    vegetation_quality = Column(Float, nullable=True)
    vegetation_index = Column(Float, nullable=True)
    soil_quality = Column(Float, nullable=True)
    pollution_level = Column(Float, nullable=True)
    climate_index = Column(Float, nullable=True)
    climate_risk = Column(Float, nullable=True)
    species_richness = Column(Integer, nullable=True)
    shannon_index = Column(Float, nullable=True)
    evenness_index = Column(Float, nullable=True)
    habitat_quality_score = Column(Float, nullable=True)
    population_stability = Column(Float, nullable=True)
    threat_level = Column(Float, nullable=True)
    protected_species_count = Column(Integer, nullable=True)
    invasive_species_count = Column(Integer, default=0)
    overall_health_score = Column(Float, nullable=True)
    ecosystem_grade = Column(String(50), nullable=True)
    grade = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
