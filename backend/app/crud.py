from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import hash_password, verify_password


def create_user(db: Session, user: schemas.UserCreate):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        return None

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user
def get_users(db: Session):
    return db.query(models.User).all()

def login_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


def create_survey(db: Session, survey: schemas.SurveyCreate):
    db_survey = models.Survey(**survey.model_dump())

    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)

    return db_survey


def get_surveys(db: Session):
    return db.query(models.Survey).all()
def get_survey_by_id(db: Session, survey_id: int):
    return db.query(models.Survey).filter(models.Survey.id == survey_id).first()


def update_survey(db: Session, survey_id: int, survey: schemas.SurveyCreate):
    db_survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()

    if not db_survey:
        return None

    db_survey.survey_name = survey.survey_name
    db_survey.location = survey.location
    db_survey.survey_date = survey.survey_date
    db_survey.survey_leader = survey.survey_leader
    db_survey.description = survey.description

    db.commit()
    db.refresh(db_survey)

    return db_survey


def delete_survey(db: Session, survey_id: int):
    db_survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()

    if not db_survey:
        return None

    db.delete(db_survey)
    db.commit()

    return db_survey
def create_monitoring_site(db: Session, site: schemas.MonitoringSiteCreate):
    db_site = models.MonitoringSite(**site.model_dump())
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site


def get_monitoring_sites(db: Session):
    return db.query(models.MonitoringSite).all()


def get_monitoring_site(db: Session, site_id: int):
    return (
        db.query(models.MonitoringSite)
        .filter(models.MonitoringSite.id == site_id)
        .first()
    )


def update_monitoring_site(
    db: Session,
    site_id: int,
    site: schemas.MonitoringSiteCreate
):
    db_site = (
        db.query(models.MonitoringSite)
        .filter(models.MonitoringSite.id == site_id)
        .first()
    )

    if not db_site:
        return None

    db_site.site_name = site.site_name
    db_site.location = site.location
    db_site.habitat_type = site.habitat_type

    db.commit()
    db.refresh(db_site)

    return db_site


def delete_monitoring_site(db: Session, site_id: int):
    db_site = (
        db.query(models.MonitoringSite)
        .filter(models.MonitoringSite.id == site_id)
        .first()
    )

    if not db_site:
        return None

    db.delete(db_site)
    db.commit()

    return db_site
def create_observation(db: Session, observation: schemas.ObservationCreate):
    db_observation = models.Observation(**observation.model_dump())
    db.add(db_observation)
    db.commit()
    db.refresh(db_observation)
    return db_observation


def get_observations(db: Session):
    return db.query(models.Observation).all()


def get_observation(db: Session, observation_id: int):
    return (
        db.query(models.Observation)
        .filter(models.Observation.id == observation_id)
        .first()
    )


def update_observation(
    db: Session,
    observation_id: int,
    observation: schemas.ObservationCreate
):
    db_observation = (
        db.query(models.Observation)
        .filter(models.Observation.id == observation_id)
        .first()
    )

    if not db_observation:
        return None

    db_observation.species_name = observation.species_name
    db_observation.observation_date = observation.observation_date
    db_observation.location = observation.location
    db_observation.observer_name = observation.observer_name
    db_observation.count = observation.count

    db.commit()
    db.refresh(db_observation)

    return db_observation


def delete_observation(db: Session, observation_id: int):
    db_observation = (
        db.query(models.Observation)
        .filter(models.Observation.id == observation_id)
        .first()
    )

    if not db_observation:
        return None

    db.delete(db_observation)
    db.commit()

    return db_observation