from datetime import date
from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.survey_repository import survey_repository
from app.models.survey import Survey
from app.models.enums import SurveyStatus
from app.core.exceptions import BadRequestException, NotFoundException

class SurveyService:
    def create_survey(
        self,
        db: Session,
        *,
        name: str,
        description: Optional[str],
        start_date: date,
        end_date: date,
        status: SurveyStatus,
        created_by_id: Any
    ) -> Survey:
        if start_date > end_date:
            raise BadRequestException("Start date cannot be after end date")
            
        survey = Survey(
            name=name,
            description=description,
            start_date=start_date,
            end_date=end_date,
            status=status,
            created_by_id=created_by_id
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)
        return survey

    def get_survey(self, db: Session, survey_id: Any) -> Survey:
        survey = survey_repository.get(db, survey_id)
        if not survey:
            raise NotFoundException("Survey not found")
        return survey

    def search_surveys(
        self,
        db: Session,
        *,
        search_query: Optional[str] = None,
        status: Optional[SurveyStatus] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[Survey], int]:
        return survey_repository.search(
            db, search_query=search_query, status=status, skip=skip, limit=limit
        )

    def update_survey(
        self,
        db: Session,
        *,
        survey_id: Any,
        name: Optional[str] = None,
        description: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status: Optional[SurveyStatus] = None
    ) -> Survey:
        survey = self.get_survey(db, survey_id)
        
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if status is not None:
            update_data["status"] = status
            
        # Date checks
        s_date = start_date if start_date is not None else survey.start_date
        e_date = end_date if end_date is not None else survey.end_date
        if s_date > e_date:
            raise BadRequestException("Start date cannot be after end date")
            
        if start_date is not None:
            update_data["start_date"] = start_date
        if end_date is not None:
            update_data["end_date"] = end_date
            
        return survey_repository.update(db, db_obj=survey, obj_in=update_data)

    def delete_survey(self, db: Session, survey_id: Any) -> Survey:
        survey = self.get_survey(db, survey_id)
        return survey_repository.remove(db, id=survey_id)

survey_service = SurveyService()
