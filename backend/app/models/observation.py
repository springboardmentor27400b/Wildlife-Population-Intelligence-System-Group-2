from sqlalchemy import Column, Integer, Date, ForeignKey
from app.database.database import Base


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("monitoring_sites.id"), nullable=False)
    observation_date = Column(Date, nullable=False)
    count = Column(Integer, nullable=False)
