from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.sql import Survey, User
from app.models.schemas import SurveyCreate, SurveyUpdate, SurveyResponse

router = APIRouter()

@router.post("/", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_survey(
    survey_in: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Researcher", "Admin"]))
):
    db_survey = Survey(
        title=survey_in.title,
        start_date=survey_in.start_date,
        end_date=survey_in.end_date,
        description=survey_in.description,
        country=survey_in.country or "Tanzania",
        created_by=current_user.id,
        status=survey_in.status
    )
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    return db_survey

@router.get("/", response_model=list[SurveyResponse])
def list_surveys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Survey).all()

@router.get("/{survey_id}", response_model=SurveyResponse)
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    return survey

@router.put("/{survey_id}", response_model=SurveyResponse)
def update_survey(
    survey_id: int,
    survey_in: SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Researcher", "Admin"]))
):
    db_survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not db_survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    
    # Update fields
    if survey_in.title is not None:
        db_survey.title = survey_in.title
    if survey_in.start_date is not None:
        db_survey.start_date = survey_in.start_date
    if survey_in.end_date is not None:
        db_survey.end_date = survey_in.end_date
    if survey_in.description is not None:
        db_survey.description = survey_in.description
    if survey_in.country is not None:
        db_survey.country = survey_in.country
    if survey_in.status is not None:
        db_survey.status = survey_in.status
        
    db.commit()
    db.refresh(db_survey)
    return db_survey

@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"]))
):
    db_survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not db_survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    
    db.delete(db_survey)
    db.commit()
    return None
