from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func

from app.database.database import Base


class EcosystemHealthHistory(Base):
    __tablename__ = "ecosystem_health_history"

    id = Column(Integer, primary_key=True, index=True)

    overall_score = Column(Float, nullable=False)

    biodiversity_score = Column(Float, nullable=False)

    population_score = Column(Float, nullable=False)

    habitat_score = Column(Float, nullable=False)

    status = Column(String(30), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )