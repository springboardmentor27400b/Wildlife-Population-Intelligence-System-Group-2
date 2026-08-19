import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    notification_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    message: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )
    severity: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False
    )
    related_species: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )
    related_site_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("monitoring_sites.id", ondelete="CASCADE"),
        nullable=True
    )
    related_device_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    is_resolved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    recipient_role: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    site: Mapped["MonitoringSite"] = relationship()

from app.models.monitoring_site import MonitoringSite
