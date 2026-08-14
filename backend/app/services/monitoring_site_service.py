from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.monitoring_site_repository import monitoring_site_repository
from app.repositories.survey_repository import survey_repository
from app.models.monitoring_site import MonitoringSite
from app.models.enums import HabitatType
from app.core.exceptions import NotFoundException
from app.utils.validators import validate_coordinates

class MonitoringSiteService:
    def create_site(
        self,
        db: Session,
        *,
        name: str,
        description: Optional[str],
        latitude: float,
        longitude: float,
        habitat_type: HabitatType,
        survey_id: Any
    ) -> MonitoringSite:
        # Validate coordinates
        validate_coordinates(latitude, longitude)
        
        # Verify survey exists
        survey = survey_repository.get(db, survey_id)
        if not survey:
            raise NotFoundException("Associated survey not found")
            
        site = MonitoringSite(
            name=name,
            description=description,
            latitude=latitude,
            longitude=longitude,
            habitat_type=habitat_type,
            survey_id=survey_id
        )
        db.add(site)
        db.commit()
        db.refresh(site)
        return site

    def get_site(self, db: Session, site_id: Any) -> MonitoringSite:
        site = monitoring_site_repository.get(db, site_id)
        if not site:
            raise NotFoundException("Monitoring site not found")
        return site

    def search_sites(
        self,
        db: Session,
        *,
        survey_id: Optional[Any] = None,
        habitat_type: Optional[HabitatType] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[MonitoringSite], int]:
        return monitoring_site_repository.search(
            db, survey_id=survey_id, habitat_type=habitat_type, search_query=search_query, skip=skip, limit=limit
        )

    def update_site(
        self,
        db: Session,
        *,
        site_id: Any,
        name: Optional[str] = None,
        description: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        habitat_type: Optional[HabitatType] = None
    ) -> MonitoringSite:
        site = self.get_site(db, site_id)
        
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if habitat_type is not None:
            update_data["habitat_type"] = habitat_type
            
        lat = latitude if latitude is not None else site.latitude
        lon = longitude if longitude is not None else site.longitude
        validate_coordinates(lat, lon)
        
        if latitude is not None:
            update_data["latitude"] = latitude
        if longitude is not None:
            update_data["longitude"] = longitude
            
        return monitoring_site_repository.update(db, db_obj=site, obj_in=update_data)

    def delete_site(self, db: Session, site_id: Any) -> MonitoringSite:
        site = self.get_site(db, site_id)
        return monitoring_site_repository.remove(db, id=site_id)

monitoring_site_service = MonitoringSiteService()
from app.models.survey import Survey
