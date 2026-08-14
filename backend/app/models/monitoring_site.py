import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.enums import HabitatType

class MonitoringSite(Base):
    __tablename__ = "monitoring_sites"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False
    )
    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    habitat_type: Mapped[HabitatType] = mapped_column(
        SQLEnum(HabitatType, native_enum=False),
        nullable=False,
        default=HabitatType.OTHER
    )
    survey_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("surveys.id", ondelete="CASCADE"),
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
    survey: Mapped["Survey"] = relationship(
        back_populates="monitoring_sites"
    )
    camera_traps: Mapped[list["CameraTrap"]] = relationship(
        back_populates="site",
        cascade="all, delete-orphan"
    )
    audio_sensors: Mapped[list["AudioSensor"]] = relationship(
        back_populates="site",
        cascade="all, delete-orphan"
    )
    observations: Mapped[list["Observation"]] = relationship(
        back_populates="site",
        cascade="all, delete-orphan"
    )
from app.models.survey import Survey
from app.models.camera_trap import CameraTrap
from app.models.audio_sensor import AudioSensor
from app.models.observation import Observation
