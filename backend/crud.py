from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from auth import hash_password, verify_password

from datetime import datetime
import os
import shutil
from fastapi import UploadFile
from ai.detector import analyze_image

from ai.audio_detector import analyze_audio



# ==========================
# USER FUNCTIONS
# ==========================

# Register User
def create_user(db: Session, user: schemas.UserCreate):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        return None

    hashed_pwd = hash_password(user.password)

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_pwd,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# Find user by email
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(
        models.User.email == email
    ).first()


# Login User
def login_user(db: Session, user: schemas.UserLogin):

    db_user = get_user_by_email(db, user.email)

    if not db_user:
        return None

    if not verify_password(user.password, db_user.password):
        return None

    return db_user

# ==========================
# ADMIN USER MANAGEMENT
# ==========================

# Get all users
def get_all_users(db: Session):
    return (
        db.query(models.User)
        .order_by(models.User.id.desc())
        .all()
    )


# Get user by ID
def get_user(db: Session, user_id: int):
    return (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )


# Update user role
def update_user_role(
    db: Session,
    user_id: int,
    role: str
):
    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        return None

    user.role = role

    db.commit()
    db.refresh(user)

    return user


# Delete user
def delete_user(
    db: Session,
    user_id: int
):
    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        return None

    db.delete(user)
    db.commit()

    return user


# ==========================
# SPECIES FUNCTIONS
# ==========================

# Add Species
def create_species(db: Session, species: schemas.SpeciesCreate):

    db_species = models.Species(
        species_name=species.species_name,
        scientific_name=species.scientific_name,
        category=species.category,
        population=species.population,
        conservation_status=species.conservation_status,
        habitat=species.habitat
    )

    db.add(db_species)
    db.commit()
    db.refresh(db_species)

    return db_species


# Get All Species
def get_all_species(db: Session):
    return db.query(models.Species).all()

# Delete Species
def delete_species(db: Session, species_id: int):

    species = db.query(models.Species).filter(
        models.Species.id == species_id
    ).first()

    if not species:
        return None

    db.delete(species)
    db.commit()

    return species

# Update Species
def update_species(db: Session, species_id: int, species: schemas.SpeciesCreate):

    db_species = db.query(models.Species).filter(
        models.Species.id == species_id
    ).first()

    if not db_species:
        return None

    db_species.species_name = species.species_name
    db_species.scientific_name = species.scientific_name
    db_species.category = species.category
    db_species.population = species.population
    db_species.conservation_status = species.conservation_status
    db_species.habitat = species.habitat

    db.commit()
    db.refresh(db_species)

    return db_species

# Dashboard Statistics
def get_dashboard_stats(db: Session):

    total_users = db.query(models.User).count()

    total_species = db.query(models.Species).count()

    total_population = sum(
        species.population
        for species in db.query(models.Species).all()
    )

    endangered_species = db.query(models.Species).filter(
        models.Species.conservation_status == "Endangered"
    ).count()

    # Protected Areas
    protected_areas = db.query(
        models.Survey.protected_area
    ).filter(
        models.Survey.protected_area.isnot(None),
        models.Survey.protected_area != ""
    ).distinct().count()

    # Active Incidents
    active_incidents = db.query(
        models.Incident
    ).filter(
        models.Incident.status == "OPEN"
    ).count()

    return {
        "total_users": total_users,
        "total_species": total_species,
        "total_population": total_population,
        "endangered_species": endangered_species,
        "protected_areas": protected_areas,
        "active_incidents": active_incidents,
    }

# Species by Category
def species_by_category(db: Session):

    result = (
        db.query(
            models.Species.category,
            func.count(models.Species.id).label("count")
        )
        .group_by(models.Species.category)
        .all()
    )

    category_data = []

    for row in result:
        category_data.append({
            "category": row.category,
            "count": row.count
        })

    return category_data

def get_recent_species(db: Session):
    return (
        db.query(models.Species)
        .order_by(models.Species.id.desc())
        .limit(5)
        .all()
    )

# Dashboard - Conservation Status
def conservation_status_chart(db: Session):

    result = (
        db.query(
            models.Species.conservation_status,
            func.count(models.Species.id)
        )
        .group_by(models.Species.conservation_status)
        .all()
    )

    chart = []

    for status, count in result:
        chart.append({
            "status": status,
            "count": count
        })

    return chart

# Dashboard - Population Chart
def population_chart(db: Session):

    result = (
        db.query(
            models.Species.species_name,
            models.Species.population
        )
        .order_by(models.Species.population.desc())
        .all()
    )

    chart = []

    for species, population in result:
        chart.append({
            "species": species,
            "population": population
        })

    return chart

# ==========================================
# Observation CRUD
# ==========================================

def create_observation(db: Session, observation: schemas.ObservationCreate):

    db_observation = models.Observation(
        species_id=observation.species_id,
        survey_id=observation.survey_id,
        location=observation.location,
        latitude=observation.latitude,
        longitude=observation.longitude,
        observation_date=observation.observation_date,
        observer_name=observation.observer_name,
        population_count=observation.population_count,
        image_path=observation.image_path,
        audio_path=observation.audio_path,
        notes=observation.notes,
    )

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
    observation: schemas.ObservationCreate,
):

    db_observation = (
        db.query(models.Observation)
        .filter(models.Observation.id == observation_id)
        .first()
    )

    if not db_observation:
        return None

    db_observation.species_id = observation.species_id
    db_observation.survey_id = observation.survey_id
    db_observation.location = observation.location
    db_observation.latitude = observation.latitude
    db_observation.longitude = observation.longitude
    db_observation.observation_date = observation.observation_date
    db_observation.observer_name = observation.observer_name
    db_observation.population_count = observation.population_count
    db_observation.image_path = observation.image_path
    db_observation.audio_path = observation.audio_path
    db_observation.notes = observation.notes

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

def get_observations(db: Session):

    return (
        db.query(models.Observation)
        .order_by(models.Observation.id.desc())
        .all()
    )

# ==========================================
# Survey CRUD
# ==========================================

from sqlalchemy.orm import Session
import models
import schemas


def create_survey(
    db: Session,
    survey: schemas.SurveyCreate,
    user_id: int
):
    db_survey = models.Survey(
        survey_id=survey.survey_id,
        title=survey.title,
        survey_date=survey.survey_date,
        protected_area=survey.protected_area,
        habitat_type=survey.habitat_type,
        monitoring_location=survey.monitoring_location,
        gps_latitude=survey.gps_latitude,
        gps_longitude=survey.gps_longitude,
        monitoring_device=survey.monitoring_device,
        researcher_name=survey.researcher_name,
        status=survey.status,
        notes=survey.notes,
    )

    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)

    return db_survey


def get_surveys(db: Session):
    return (
        db.query(models.Survey)
        .order_by(models.Survey.id.desc())
        .all()
    )


def get_survey(db: Session, survey_id: int):
    return (
        db.query(models.Survey)
        .filter(models.Survey.id == survey_id)
        .first()
    )


def update_survey(
    db: Session,
    survey_id: int,
    survey: schemas.SurveyUpdate,
):

    db_survey = (
        db.query(models.Survey)
        .filter(models.Survey.id == survey_id)
        .first()
    )

    if not db_survey:
        return None

    db_survey.survey_id = survey.survey_id
    db_survey.title = survey.title
    db_survey.survey_date = survey.survey_date
    db_survey.protected_area = survey.protected_area
    db_survey.habitat_type = survey.habitat_type
    db_survey.monitoring_location = survey.monitoring_location
    db_survey.gps_latitude = survey.gps_latitude
    db_survey.gps_longitude = survey.gps_longitude
    db_survey.monitoring_device = survey.monitoring_device
    db_survey.researcher_name = survey.researcher_name
    db_survey.status = survey.status
    db_survey.notes = survey.notes

    db.commit()
    db.refresh(db_survey)

    return db_survey


def delete_survey(
    db: Session,
    survey_id: int,
):

    db_survey = (
        db.query(models.Survey)
        .filter(models.Survey.id == survey_id)
        .first()
    )

    if not db_survey:
        return None

    db.delete(db_survey)
    db.commit()

    return db_survey

# ==========================================
# Image Analysis CRUD
# ==========================================

from datetime import datetime
import os
import shutil
from fastapi import UploadFile

from ai.detector import analyze_image
import models


def create_image_analysis(
    db: Session,
    file: UploadFile,
    survey_id: int,
    image_type: str,
    user_id: int,
):
    # Create upload folder
    upload_folder = "uploads/wildlife_images"
    os.makedirs(upload_folder, exist_ok=True)

    # Save uploaded image
    file_path = os.path.join(upload_folder, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run AI Detection
    result = analyze_image(file_path)

    # Generate AI Report
    analysis_report = (
        f"Detected {result['animal_count']} animal(s). "
        f"Species: {', '.join([d['species'] for d in result['detections']])}."
    )

    # Save AI result into database
    db_image = models.ImageAnalysis(
        image_name=file.filename,
        image_path=file_path,
        image_type=image_type,
        processing_status="Completed",
        survey_id=survey_id,
        uploaded_by=user_id,
        uploaded_at=datetime.utcnow(),

        species_detected=", ".join(
            [d["species"] for d in result["detections"]]
        ),

        animal_count=result["animal_count"],

        confidence=max(
            [d["confidence"] for d in result["detections"]],
            default=0
        ),

        result_image=result["annotated_image"],

        analysis_report=analysis_report,
    )

    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return db_image


def get_all_images(db: Session):
    return (
        db.query(models.ImageAnalysis)
        .order_by(models.ImageAnalysis.id.desc())
        .all()
    )


def get_image(db: Session, image_id: int):
    return (
        db.query(models.ImageAnalysis)
        .filter(models.ImageAnalysis.id == image_id)
        .first()
    )


def delete_image(db: Session, image_id: int):

    image = (
        db.query(models.ImageAnalysis)
        .filter(models.ImageAnalysis.id == image_id)
        .first()
    )

    if image is None:
        return None

    # Delete uploaded image
    if os.path.exists(image.image_path):
        os.remove(image.image_path)

    # Delete annotated image
    if image.result_image and os.path.exists(image.result_image):
        os.remove(image.result_image)

    db.delete(image)
    db.commit()

    return image

# ==========================================
# Audio Analysis CRUD
# ==========================================

def create_audio_analysis(
    db: Session,
    file: UploadFile,
    survey_id: int,
    audio_type: str,
    user_id: int,
):
    # Create upload folder
    upload_folder = "uploads/wildlife_audio"
    os.makedirs(upload_folder, exist_ok=True)

    # Save audio file
    file_path = os.path.join(upload_folder, file.filename)
    file_path = file_path.replace("\\", "/")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # AI Detection
    print("=" * 50)
    print("Audio file saved at:", file_path)

    result = analyze_audio(file_path)
    print("========== AI RESULT ==========")
    print(result)
    print("===============================")

    print("AI RESULT:")
    print(result)
    print("=" * 50)

    # Save to database
    db_audio = models.AudioAnalysis(
        audio_name=file.filename,
        audio_path=file_path,
        audio_type=audio_type,

        survey_id=survey_id,
        uploaded_by=user_id,

        uploaded_at=datetime.utcnow(),

        processing_status="Completed",

        species_detected=result["species"],

        confidence=result["confidence"],

        analysis_report=result["analysis_report"],
    )

    db.add(db_audio)
    db.commit()
    db.refresh(db_audio)

    return db_audio

def get_all_audio(db: Session):
    return (
        db.query(models.AudioAnalysis)
        .order_by(models.AudioAnalysis.id.desc())
        .all()
    )

# ==========================================
# Species Classification CRUD
# ==========================================

def create_species_classification(db, result):

    db_result = models.SpeciesClassification(

        image_name=result["image_name"],
        image_path=result["uploaded_image"],
        annotated_image=result["annotated_image"],

        common_name=result["common_name"],
        scientific_name=result["scientific_name"],

        kingdom=result["kingdom"],
        phylum=result["phylum"],
        class_name=result["class_name"],
        order=result["order"],
        family=result["family"],
        genus=result["genus"],

        conservation_status=result["conservation_status"],

        confidence=result["confidence"],

        description=result["description"]

    )

    db.add(db_result)
    db.commit()
    db.refresh(db_result)

    return db_result
#==========================================
# Habitat Analysis CRUD
#==========================================
def create_habitat(db, habitat):

    db_item = models.HabitatAnalysis(**habitat)

    db.add(db_item)

    db.commit()

    db.refresh(db_item)

    return db_item