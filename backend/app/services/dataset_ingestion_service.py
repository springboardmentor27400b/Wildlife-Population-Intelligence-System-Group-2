from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models.species import Species
from app.models.species_record import SpeciesRecord

DATASET_ROOT = Path(__file__).resolve().parent.parent.parent / "datasets"


def ingest_dataset_metadata(db: Session) -> dict[str, Any]:
    discovered_species: list[str] = []

    species_csv = DATASET_ROOT / "species.csv"
    if species_csv.exists():
        for line in species_csv.read_text(encoding="utf-8").splitlines()[1:]:
            if not line.strip():
                continue
            values = [value.strip() for value in line.split(",")]
            if values:
                discovered_species.append(values[0])

    image_directories = [
        DATASET_ROOT / "images" / "animal_kingdom",
        DATASET_ROOT / "images" / "inaturalist",
        DATASET_ROOT / "images" / "snapshot_serengeti",
    ]
    for directory in image_directories:
        if directory.exists():
            discovered_species.append(directory.name.replace("_", " ").title())

    audio_directories = [DATASET_ROOT / "audio" / "birdclef"]
    for directory in audio_directories:
        if directory.exists():
            discovered_species.append(directory.name.replace("_", " ").title())

    metadata_directories = [DATASET_ROOT / "metadata" / "gbif"]
    for directory in metadata_directories:
        if directory.exists():
            discovered_species.append(directory.name.replace("_", " ").title())

    unique_species = sorted(set(discovered_species))
    for species_name in unique_species:
        existing = db.query(Species).filter(Species.common_name.ilike(species_name)).first()
        if existing:
            continue
        db.add(Species(common_name=species_name, scientific_name=species_name, category="Dataset", iucn_status="Data Deficient"))

    db.flush()
    for species_name in unique_species:
        existing_record = db.query(SpeciesRecord).filter(SpeciesRecord.common_name.ilike(species_name)).first()
        if existing_record:
            continue
        db.add(SpeciesRecord(common_name=species_name, scientific_name=species_name, family="Unknown", genus="Unknown", habitat="Dataset", status="Data Deficient", confidence=0.75))

    db.commit()
    return {"species_added": len(unique_species), "species": unique_species}
