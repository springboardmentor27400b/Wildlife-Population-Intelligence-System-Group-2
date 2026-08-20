import crud
import schemas


def add_species(db, species: schemas.SpeciesCreate):
    return crud.create_species(db, species)


def get_species_list(db):
    return crud.get_all_species(db)


def delete_species(db, species_id: int):
    return crud.delete_species(db, species_id)


def update_species_item(db, species_id: int, species: schemas.SpeciesCreate):
    return crud.update_species(db, species_id, species)
