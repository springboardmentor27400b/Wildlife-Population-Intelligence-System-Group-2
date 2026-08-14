from typing import List, Optional, Tuple, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.repositories.base_repository import BaseRepository
from app.models.observation import Observation

class ObservationRepository(BaseRepository[Observation, Any, Any]):
    def search(
        self,
        db: Session,
        *,
        site_id: Optional[Any] = None,
        species: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[Observation], int]:
        query = db.query(self.model).options(joinedload(self.model.media))
        
        if site_id:
            query = query.filter(self.model.site_id == site_id)
        if species:
            query = query.filter(self.model.species.ilike(f"%{species}%"))
        if start_date:
            query = query.filter(self.model.observed_at >= start_date)
        if end_date:
            query = query.filter(self.model.observed_at <= end_date)
            
        total = query.count()
        items = query.order_by(self.model.observed_at.desc()).offset(skip).limit(limit).all()
        return items, total

observation_repository = ObservationRepository(Observation)
