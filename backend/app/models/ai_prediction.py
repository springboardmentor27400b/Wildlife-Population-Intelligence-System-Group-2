import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    media_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("media.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    observation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("observations.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    species_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("species_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    detection_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    detection_time_ms: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )
    annotated_image_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )
    raw_json_response: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    media: Mapped["Media"] = relationship(foreign_keys=[media_id])
    observation: Mapped["Observation"] = relationship(foreign_keys=[observation_id], back_populates="ai_predictions")
    species_profile: Mapped["SpeciesProfile"] = relationship(foreign_keys=[species_profile_id])
    
from app.models.media import Media
from app.models.observation import Observation
from app.models.species_profile import SpeciesProfile
