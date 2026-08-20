import crud
import schemas


def add_observation(db, observation: schemas.ObservationCreate):
    return crud.create_observation(db, observation)


def get_observations_list(db):
    return crud.get_observations(db)


def get_observation_by_id(db, observation_id: int):
    return crud.get_observation(db, observation_id)


def update_observation_item(db, observation_id: int, observation: schemas.ObservationCreate):
    return crud.update_observation(db, observation_id, observation)


def delete_observation(db, observation_id: int):
    return crud.delete_observation(db, observation_id)
