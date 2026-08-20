from sqlalchemy import Column, Integer, String
from app.database.database import Base


class Taxonomy(Base):
    __tablename__ = "taxonomy"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String(255), unique=True, index=True, nullable=False)
    scientific_name = Column(String(255), nullable=False)
    family = Column(String(100), nullable=True)
    genus = Column(String(100), nullable=True)
    habitat = Column(String(255), nullable=True)
    diet = Column(String(255), nullable=True)
    average_lifespan = Column(String(100), nullable=True)
    iucn_status = Column(String(100), nullable=True)
    species_image = Column(String(500), nullable=True)
    gbif_id = Column(Integer, nullable=True)
