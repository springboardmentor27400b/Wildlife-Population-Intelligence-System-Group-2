from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.monitoring_site import MonitoringSite
from app.models.enums import HabitatType

class MonitoringSiteRepository(BaseRepository[MonitoringSite, Any, Any]):
    def search(
        self,
        db: Session,
        *,
        survey_id: Optional[Any] = None,
        habitat_type: Optional[HabitatType] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[MonitoringSite], int]:
        query = db.query(self.model)
        
        if survey_id:
            query = query.filter(self.model.survey_id == survey_id)
        if habitat_type:
            query = query.filter(self.model.habitat_type == habitat_type)
        if search_query:
            query = query.filter(self.model.name.ilike(f"%{search_query}%"))
            
        total = query.count()
        items = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

monitoring_site_repository = MonitoringSiteRepository(MonitoringSite)
