from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
import models

from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/surveys",
    tags=["Survey Management"]
)


# ==========================================
# Create Survey
# ==========================================
@router.post("/", response_model=schemas.SurveyResponse)
def create_survey(
    survey: schemas.SurveyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_survey(
        db=db,
        survey=survey,
        user_id=current_user.id
    )


# ==========================================
# Get All Surveys
# ==========================================
@router.get("/", response_model=List[schemas.SurveyResponse])
def get_surveys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_surveys(db)


# ==========================================
# Get Survey By ID
# ==========================================
@router.get("/{survey_id}", response_model=schemas.SurveyResponse)
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    survey = crud.get_survey(db, survey_id)

    if survey is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    return survey


# ==========================================
# Update Survey
# ==========================================
@router.put("/{survey_id}", response_model=schemas.SurveyResponse)
def update_survey(
    survey_id: int,
    survey: schemas.SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    updated = crud.update_survey(
        db=db,
        survey_id=survey_id,
        survey=survey
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    return updated


# ==========================================
# Delete Survey
# ==========================================
@router.delete("/{survey_id}")
def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    deleted = crud.delete_survey(db, survey_id)

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    return {
        "message": "Survey deleted successfully"
    }