import uuid
from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class SpeciesProfile(Base):
    __tablename__ = "species_profiles"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    common_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    scientific_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True
    )
    taxonomy: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    ) # {"kingdom": "...", "phylum": "...", "class": "...", "order": "...", "family": "...", "genus": "...", "species": "..."}
    
    habitat: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )
    diet: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    lifespan: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    conservation_status: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    population_trend: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    population_estimate: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    threat_level: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    native_regions: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )
    interesting_facts: Mapped[list] = mapped_column(
        JSON,
        nullable=False
    )
    wikipedia_link: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )
    iucn_link: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )
