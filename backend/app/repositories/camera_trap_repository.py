from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.camera_trap import CameraTrap
from app.models.enums import DeviceStatus

class CameraTrapRepository(BaseRepository[CameraTrap, Any, Any]):
    def get_by_serial(self, db: Session, *, serial_number: str) -> Optional[CameraTrap]:
        return db.query(self.model).filter(self.model.serial_number == serial_number).first()

    def search(
        self,
        db: Session,
        *,
        site_id: Optional[Any] = None,
        status: Optional[DeviceStatus] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[CameraTrap], int]:
        query = db.query(self.model)
        
        if site_id:
            query = query.filter(self.model.site_id == site_id)
        if status:
            query = query.filter(self.model.status == status)
        if search_query:
            query = query.filter(
                (self.model.model.ilike(f"%{search_query}%")) | 
                (self.model.serial_number.ilike(f"%{search_query}%"))
            )
            
        total = query.count()
        items = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

camera_trap_repository = CameraTrapRepository(CameraTrap)
