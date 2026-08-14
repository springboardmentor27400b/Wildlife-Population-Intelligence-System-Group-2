import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Date, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.enums import SurveyStatus

class Survey(Base):
    __tablename__ = "surveys"
    
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
    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )
    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )
    status: Mapped[SurveyStatus] = mapped_column(
        SQLEnum(SurveyStatus, native_enum=False),
        nullable=False,
        default=SurveyStatus.PLANNED
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
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
    created_by: Mapped["User"] = relationship(
        back_populates="surveys"
    )
    monitoring_sites: Mapped[list["MonitoringSite"]] = relationship(
        back_populates="survey",
        cascade="all, delete-orphan"
    )
from app.models.user import User
from app.models.monitoring_site import MonitoringSite
