from sqlalchemy import Column, Integer, String, Float
from app.database.database import Base


class MonitoringSite(Base):
    __tablename__ = "monitoring_sites"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    habitat = Column(String(255), nullable=False)
    country = Column(String(255), nullable=False)
