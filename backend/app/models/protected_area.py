from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.database.database import Base


class ProtectedArea(Base):
    __tablename__ = "protected_areas"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False, unique=True)

    state = Column(String(100), nullable=False)

    district = Column(String(100), nullable=False)

    area_type = Column(String(100), nullable=False)

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)

    total_area_sqkm = Column(Float)

    description = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )