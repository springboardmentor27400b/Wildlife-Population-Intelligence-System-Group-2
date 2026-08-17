from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.role_checker import require_role
from app.dependencies import get_current_user
router = APIRouter(
    prefix="/surveys",
    tags=["Surveys"]
)


@router.post("/", response_model=schemas.SurveyResponse)
def create_survey(
    survey: schemas.SurveyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(["Admin", "Researcher"])
    )
):
    return crud.create_survey(db, survey)


@router.get("/", response_model=list[schemas.SurveyResponse])
def get_surveys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_surveys(db)


@router.get("/{survey_id}", response_model=schemas.SurveyResponse)
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    survey = crud.get_survey_by_id(db, survey_id)

    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    return survey


@router.put("/{survey_id}", response_model=schemas.SurveyResponse)
def update_survey(
    survey_id: int,
    survey: schemas.SurveyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(["Admin", "Researcher"])
    )
):
    updated = crud.update_survey(db, survey_id, survey)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    return updated


@router.delete("/{survey_id}")
def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(["Admin", "Researcher"])
    )
):
    deleted = crud.delete_survey(db, survey_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )

    return {
        "message": "Survey deleted successfully"
    }