from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database.database import Base


class SpeciesRecord(Base):
    __tablename__ = "species_records"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String(255), nullable=False)
    scientific_name = Column(String(255), nullable=True)
    family = Column(String(255), nullable=True)
    genus = Column(String(255), nullable=True)
    habitat = Column(String(255), nullable=True)
    status = Column(String(255), nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
