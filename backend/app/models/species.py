from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database.database import Base


class Species(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True, index=True)

    common_name = Column(String(100), nullable=False, unique=True)

    scientific_name = Column(String(150), nullable=False)

    category = Column(String(50), nullable=False)

    iucn_status = Column(String(50), nullable=False)

    description = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )