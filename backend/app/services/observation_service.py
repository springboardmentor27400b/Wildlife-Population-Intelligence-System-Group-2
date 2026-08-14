from datetime import datetime
from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.observation_repository import observation_repository
from app.repositories.monitoring_site_repository import monitoring_site_repository
from app.models.observation import Observation
from app.core.exceptions import NotFoundException
from app.utils.validators import validate_coordinates

class ObservationService:
    def create_observation(
        self,
        db: Session,
        *,
        species: str,
        count: int,
        observed_at: datetime,
        latitude: float,
        longitude: float,
        notes: Optional[str],
        site_id: Any,
        reporter_id: Optional[Any]
    ) -> Observation:
        # Validate coordinates
        validate_coordinates(latitude, longitude)
        
        # Verify site
        site = monitoring_site_repository.get(db, site_id)
        if not site:
            raise NotFoundException("Associated monitoring site not found")
            
        observation = Observation(
            species=species,
            count=count,
            observed_at=observed_at,
            latitude=latitude,
            longitude=longitude,
            notes=notes,
            site_id=site_id,
            reporter_id=reporter_id
        )
        db.add(observation)
        db.commit()
        db.refresh(observation)
        return observation

    def get_observation(self, db: Session, observation_id: Any) -> Observation:
        observation = observation_repository.get(db, observation_id)
        if not observation:
            raise NotFoundException("Observation not found")
            
        return observation

    def search_observations(
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
        return observation_repository.search(
            db, site_id=site_id, species=species, start_date=start_date, end_date=end_date, skip=skip, limit=limit
        )

    def update_observation(
        self,
        db: Session,
        *,
        observation_id: Any,
        species: Optional[str] = None,
        count: Optional[int] = None,
        observed_at: Optional[datetime] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        notes: Optional[str] = None,
        site_id: Optional[Any] = None
    ) -> Observation:
        observation = self.get_observation(db, observation_id)
        
        update_data = {}
        if species is not None:
            update_data["species"] = species
        if count is not None:
            update_data["count"] = count
        if observed_at is not None:
            update_data["observed_at"] = observed_at
        if notes is not None:
            update_data["notes"] = notes
            
        if site_id is not None:
            site = monitoring_site_repository.get(db, site_id)
            if not site:
                raise NotFoundException("Associated monitoring site not found")
            update_data["site_id"] = site_id
            
        lat = latitude if latitude is not None else observation.latitude
        lon = longitude if longitude is not None else observation.longitude
        validate_coordinates(lat, lon)
        
        if latitude is not None:
            update_data["latitude"] = latitude
        if longitude is not None:
            update_data["longitude"] = longitude
            
        return observation_repository.update(db, db_obj=observation, obj_in=update_data)

    def delete_observation(self, db: Session, observation_id: Any) -> Observation:
        observation = self.get_observation(db, observation_id)
        return observation_repository.remove(db, id=observation_id)

observation_service = ObservationService()
