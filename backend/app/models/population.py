from sqlalchemy import Column, Integer, String, Float, DateTime, Date, func
from app.database.database import Base

class PopulationStatistic(Base):
    __tablename__ = "population_statistics"

    id = Column(Integer, primary_key=True, index=True)
    species_id = Column(Integer, nullable=True)
    habitat_id = Column(Integer, nullable=True)
    species = Column(String(255), nullable=False)
    species_name = Column(String(255), nullable=True)
    common_name = Column(String(255), nullable=True)
    scientific_name = Column(String(255), nullable=True)
    estimated_population = Column(Integer, nullable=True)
    estimated_count = Column(Integer, nullable=True)
    current_population = Column(Integer, nullable=True)
    previous_population = Column(Integer, nullable=True)
    habitat = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    protected_area = Column(String(255), nullable=True)
    confidence_score = Column(Float, nullable=True)
    male_count = Column(Integer, nullable=True)
    female_count = Column(Integer, nullable=True)
    juvenile_count = Column(Integer, nullable=True)
    adult_count = Column(Integer, nullable=True)
    density = Column(Float, nullable=True)
    growth_rate = Column(Float, nullable=True)
    birth_rate = Column(Float, nullable=True)
    mortality_rate = Column(Float, nullable=True)
    migration_rate = Column(Float, nullable=True)
    migration_index = Column(Float, nullable=True)
    population_status = Column(String(50), nullable=True)
    density_per_km2 = Column(Float, nullable=True)
    habitat_area_km2 = Column(Float, nullable=True)
    recorded_date = Column(Date, nullable=True)
    survey_date = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PopulationTrend(Base):
    __tablename__ = "population_trends"

    id = Column(Integer, primary_key=True, index=True)
    species = Column(String(255), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    count = Column(Integer, nullable=False)
    growth_rate = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PopulationDensity(Base):
    __tablename__ = "population_densities"

    id = Column(Integer, primary_key=True, index=True)
    habitat_name = Column(String(255), nullable=False)
    species = Column(String(255), nullable=False)
    density = Column(Float, nullable=False)
    area_km2 = Column(Float, nullable=False)
    population_count = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
