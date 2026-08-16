from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.species import Species
from app.models.user import User
from app.schemas.species import SpeciesOut

router = APIRouter(tags=["species"])


@router.get("/species", response_model=list[SpeciesOut])
def list_species(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[SpeciesOut]:
    species = db.query(Species).all()
    return [SpeciesOut(id=item.id, common_name=item.common_name, scientific_name=item.scientific_name, category=item.category, iucn_status=item.iucn_status) for item in species]


@router.get("/species/gbif/{name}")
def get_gbif_taxonomy(name: str, current_user: User = Depends(get_current_user)):
    from app.services.gbif_service import fetch_gbif_taxonomy
    return fetch_gbif_taxonomy(name)

