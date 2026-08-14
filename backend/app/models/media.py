import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Media(Base):
    __tablename__ = "media"
    
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
    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    file_url: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )
    public_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    file_type: Mapped[str] = mapped_column(
        String(50),  # "image" or "audio"
        nullable=False
    )
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    observation: Mapped["Observation"] = relationship(
        back_populates="media"
    )
from app.models.observation import Observation
