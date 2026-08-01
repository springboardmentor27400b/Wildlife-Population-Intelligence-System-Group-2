from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.survey import Survey
from app.models.user import User
from app.schemas.survey import SurveyCreate, SurveyOut

router = APIRouter(tags=["surveys"])


@router.post("/survey", response_model=SurveyOut)
def create_survey(survey_data: SurveyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> SurveyOut:
    survey = Survey(site_id=survey_data.site_id, user_id=current_user.id, survey_date=survey_data.survey_date, device=survey_data.device, remarks=survey_data.remarks)
    db.add(survey)
    db.commit()
    db.refresh(survey)
    try:
        from app.services.intelligence_engine import recalculate_all_intelligence
        recalculate_all_intelligence(db)
    except Exception:
        pass
    return SurveyOut(id=survey.id, site_id=survey.site_id, user_id=survey.user_id, survey_date=survey.survey_date, device=survey.device, remarks=survey.remarks)


@router.get("/survey", response_model=list[SurveyOut])
def list_surveys(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[SurveyOut]:
    surveys = db.query(Survey).filter(Survey.user_id == current_user.id).all()
    return [SurveyOut(id=survey.id, site_id=survey.site_id, user_id=survey.user_id, survey_date=survey.survey_date, device=survey.device, remarks=survey.remarks) for survey in surveys]
