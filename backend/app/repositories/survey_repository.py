from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.survey import Survey
from app.models.enums import SurveyStatus

class SurveyRepository(BaseRepository[Survey, Any, Any]):
    def get_multi_by_owner(
        self, db: Session, *, created_by_id: Any, skip: int = 0, limit: int = 100
    ) -> List[Survey]:
        return (
            db.query(self.model)
            .filter(self.model.created_by_id == created_by_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search(
        self,
        db: Session,
        *,
        search_query: Optional[str] = None,
        status: Optional[SurveyStatus] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[Survey], int]:
        query = db.query(self.model)
        
        if search_query:
            query = query.filter(self.model.name.ilike(f"%{search_query}%"))
        if status:
            query = query.filter(self.model.status == status)
            
        total = query.count()
        items = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

survey_repository = SurveyRepository(Survey)
