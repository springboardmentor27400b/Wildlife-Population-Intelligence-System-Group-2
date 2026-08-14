import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    observation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("observations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    image_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    audio_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    image_json: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True
    )
    audio_json: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="Not Started",
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relationships
    observation: Mapped["Observation"] = relationship(
        foreign_keys=[observation_id],
        back_populates="ai_analyses"
    )

from app.models.observation import Observation
