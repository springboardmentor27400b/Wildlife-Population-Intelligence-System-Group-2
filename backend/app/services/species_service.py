from sqlalchemy.orm import Session

from app.models.species import Species
from app.schemas.species import SpeciesCreate


def create_species(db: Session, species: SpeciesCreate):
    existing = (
        db.query(Species)
        .filter(Species.common_name == species.common_name)
        .first()
    )

    if existing:
        return None

    new_species = Species(
        common_name=species.common_name,
        scientific_name=species.scientific_name,
        category=species.category,
        iucn_status=species.iucn_status,
        description=species.description,
    )

    db.add(new_species)
    db.commit()
    db.refresh(new_species)

    return new_species


def get_all_species(db: Session):
    return db.query(Species).order_by(Species.common_name).all()


def get_species_by_id(db: Session, species_id: int):
    return db.query(Species).filter(Species.id == species_id).first()