from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class WildlifeObservation(Base):
    __tablename__ = "wildlife_observations"

    id = Column(Integer, primary_key=True, index=True)

    species_id = Column(
        Integer,
        ForeignKey("species.id"),
        nullable=False,
    )

    protected_area_id = Column(
        Integer,
        ForeignKey("protected_areas.id"),
        nullable=False,
    )

    observer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    observation_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)

    animal_count = Column(Integer, nullable=False)

    observation_type = Column(String(50))

    image_path = Column(String(255))

    notes = Column(String(500))

    species = relationship("Species")

    protected_area = relationship("ProtectedArea")

    observer = relationship("User")