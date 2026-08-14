import uuid
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.species_profile import SpeciesProfile
from app.core.exceptions import NotFoundException, BadRequestException

class SpeciesProfileService:
    def list_profiles(
        self,
        db: Session,
        *,
        search: Optional[str] = None,
        conservation_status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[SpeciesProfile], int]:
        """
        Lists and filters species profiles with pagination.
        """
        query = db.query(SpeciesProfile)
        
        if search:
            query = query.filter(
                (SpeciesProfile.common_name.ilike(f"%{search}%")) |
                (SpeciesProfile.scientific_name.ilike(f"%{search}%"))
            )
            
        if conservation_status:
            query = query.filter(SpeciesProfile.conservation_status == conservation_status)
            
        total = query.count()
        items = query.order_by(SpeciesProfile.common_name).offset(skip).limit(limit).all()
        return items, total

    def get_profile(self, db: Session, profile_id: uuid.UUID) -> SpeciesProfile:
        profile = db.query(SpeciesProfile).filter(SpeciesProfile.id == profile_id).first()
        if not profile:
            raise NotFoundException("Species profile not found")
        return profile

    def get_profile_by_scientific_name(self, db: Session, scientific_name: str) -> SpeciesProfile:
        profile = db.query(SpeciesProfile).filter(SpeciesProfile.scientific_name == scientific_name).first()
        if not profile:
            raise NotFoundException("Species profile not found for this scientific name")
        return profile

    def create_profile(self, db: Session, *, obj_in: dict) -> SpeciesProfile:
        existing = db.query(SpeciesProfile).filter(SpeciesProfile.scientific_name == obj_in.get("scientific_name")).first()
        if existing:
            raise BadRequestException("A profile with this scientific name already exists")
            
        profile = SpeciesProfile(
            common_name=obj_in["common_name"],
            scientific_name=obj_in["scientific_name"],
            taxonomy=obj_in["taxonomy"],
            habitat=obj_in["habitat"],
            diet=obj_in["diet"],
            lifespan=obj_in["lifespan"],
            conservation_status=obj_in["conservation_status"],
            population_trend=obj_in["population_trend"],
            population_estimate=obj_in["population_estimate"],
            threat_level=obj_in["threat_level"],
            native_regions=obj_in["native_regions"],
            interesting_facts=obj_in["interesting_facts"],
            wikipedia_link=obj_in.get("wikipedia_link"),
            iucn_link=obj_in.get("iucn_link")
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    def update_profile(self, db: Session, *, profile_id: uuid.UUID, obj_in: dict) -> SpeciesProfile:
        profile = self.get_profile(db, profile_id)
        
        # Check scientific name unique constraint
        new_sci = obj_in.get("scientific_name")
        if new_sci and new_sci != profile.scientific_name:
            existing = db.query(SpeciesProfile).filter(SpeciesProfile.scientific_name == new_sci).first()
            if existing:
                raise BadRequestException("A profile with this scientific name already exists")
                
        for field in obj_in:
            if hasattr(profile, field):
                setattr(profile, field, obj_in[field])
                
        db.commit()
        db.refresh(profile)
        return profile

    def delete_profile(self, db: Session, *, profile_id: uuid.UUID) -> SpeciesProfile:
        profile = self.get_profile(db, profile_id)
        db.delete(profile)
        db.commit()
        return profile

species_profile_service = SpeciesProfileService()
