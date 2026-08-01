from sqlalchemy import Column, Integer, String
from app.database.database import Base


class Species(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String(255), nullable=False)
    scientific_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    iucn_status = Column(String(50), nullable=False)
