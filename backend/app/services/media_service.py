from typing import List, Any
from sqlalchemy.orm import Session
from app.repositories.media_repository import media_repository
from app.repositories.observation_repository import observation_repository
from app.models.media import Media
from app.core.exceptions import NotFoundException

class MediaService:
    def create_media(
        self,
        db: Session,
        *,
        observation_id: Any,
        file_name: str,
        file_url: str,
        public_id: str,
        mime_type: str,
        file_size: int,
        file_type: str
    ) -> Media:
        # Verify observation exists
        observation = observation_repository.get(db, observation_id)
        if not observation:
            raise NotFoundException("Associated observation not found")
            
        media = Media(
            observation_id=observation_id,
            file_name=file_name,
            file_url=file_url,
            public_id=public_id,
            mime_type=mime_type,
            file_size=file_size,
            file_type=file_type
        )
        db.add(media)
        db.commit()
        db.refresh(media)
        
        return media

    def get_by_observation(self, db: Session, observation_id: Any) -> List[Media]:
        # Verify observation exists
        observation = observation_repository.get(db, observation_id)
        if not observation:
            raise NotFoundException("Observation not found")
        return media_repository.get_by_observation(db, observation_id=observation_id)

    def delete_media(self, db: Session, media_id: Any) -> Media:
        media = media_repository.get(db, media_id)
        if not media:
            raise NotFoundException("Media not found")
        return media_repository.remove(db, id=media_id)

media_service = MediaService()
