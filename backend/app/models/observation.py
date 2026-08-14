import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Observation(Base):
    __tablename__ = "observations"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    species: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False
    )
    count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    notes: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True
    )
    site_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("monitoring_sites.id", ondelete="CASCADE"),
        nullable=False
    )
    reporter_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
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
    site: Mapped["MonitoringSite"] = relationship(
        back_populates="observations"
    )
    reporter: Mapped["User"] = relationship(
        back_populates="observations"
    )
    media: Mapped[list["Media"]] = relationship(
        back_populates="observation",
        cascade="all, delete-orphan"
    )
    ai_predictions: Mapped[list["AIPrediction"]] = relationship(
        back_populates="observation",
        cascade="all, delete-orphan"
    )
    ai_analyses: Mapped[list["AIAnalysis"]] = relationship(
        back_populates="observation",
        cascade="all, delete-orphan"
    )

    @property
    def ai_status(self) -> str:
        if self.ai_analyses:
            return self.ai_analyses[-1].status
        return "Not Started"
from app.models.monitoring_site import MonitoringSite
from app.models.user import User
from app.models.media import Media
from app.models.ai_prediction import AIPrediction
from app.models.ai_analysis import AIAnalysis
