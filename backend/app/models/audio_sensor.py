import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.enums import DeviceStatus

class AudioSensor(Base):
    __tablename__ = "audio_sensors"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    model: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    serial_number: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )
    status: Mapped[DeviceStatus] = mapped_column(
        SQLEnum(DeviceStatus, native_enum=False),
        nullable=False,
        default=DeviceStatus.ACTIVE
    )
    site_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("monitoring_sites.id", ondelete="SET NULL"),
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
        back_populates="audio_sensors"
    )
from app.models.monitoring_site import MonitoringSite
