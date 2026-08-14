from typing import List, Any
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.media import Media

class MediaRepository(BaseRepository[Media, Any, Any]):
    def get_by_observation(self, db: Session, *, observation_id: Any) -> List[Media]:
        return db.query(self.model).filter(self.model.observation_id == observation_id).all()

media_repository = MediaRepository(Media)
