from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, models
from app.dependencies import get_current_user
from app.role_checker import require_role

from datetime import date
import os
import shutil

router = APIRouter(
    prefix="/observations",
    tags=["Wildlife Observations"]
)

IMAGE_DIR = "uploads/images"
AUDIO_DIR = "uploads/audio"

os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)


@router.post("/")
async def create_observation(
    species_name: str = Form(...),
    observation_date: date = Form(...),
    location: str = Form(...),
    observer_name: str = Form(...),
    count: int = Form(...),
    

    image: UploadFile = File(None),
    audio: UploadFile = File(None),

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        require_role([
            "Admin",
            "Researcher",
            "Forest Officer"
        ])
    )
):

    image_path = None
    audio_path = None

    if image:

        image_path = os.path.join(
            IMAGE_DIR,
            image.filename
        )

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(
                image.file,
                buffer
            )

    if audio:

        audio_path = os.path.join(
            AUDIO_DIR,
            audio.filename
        )

        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(
                audio.file,
                buffer
            )

    observation = models.Observation(
        species_name=species_name,
        observation_date=observation_date,
        location=location,
        observer_name=observer_name,
        count=count,
        image_path=image_path,
        audio_path=audio_path
    )

    db.add(observation)
    db.commit()
    db.refresh(observation)

    return observation


@router.get("/")
def get_observations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_observations(db)


@router.get("/{observation_id}")
def get_observation(
    observation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    observation = crud.get_observation(
        db,
        observation_id
    )

    if not observation:
        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    return observation


@router.delete("/{observation_id}")
def delete_observation(
    observation_id: int,
    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        require_role([
            "Admin",
            "Researcher",
            "Forest Officer"
        ])
    )
):

    deleted = crud.delete_observation(
        db,
        observation_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    return {
        "message": "Observation deleted successfully"
    }