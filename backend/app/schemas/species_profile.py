import uuid
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict

class SpeciesProfileBase(BaseModel):
    common_name: str
    scientific_name: str
    taxonomy: dict # {"kingdom": "...", "phylum": "...", "class": "...", "order": "...", "family": "...", "genus": "...", "species": "..."}
    habitat: str
    diet: str
    lifespan: str
    conservation_status: str
    population_trend: str
    population_estimate: str
    threat_level: str
    native_regions: str
    interesting_facts: list
    wikipedia_link: Optional[str] = None
    iucn_link: Optional[str] = None

class SpeciesProfileCreate(SpeciesProfileBase):
    pass

class SpeciesProfileUpdate(BaseModel):
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    taxonomy: Optional[dict] = None
    habitat: Optional[str] = None
    diet: Optional[str] = None
    lifespan: Optional[str] = None
    conservation_status: Optional[str] = None
    population_trend: Optional[str] = None
    population_estimate: Optional[str] = None
    threat_level: Optional[str] = None
    native_regions: Optional[str] = None
    interesting_facts: Optional[list] = None
    wikipedia_link: Optional[str] = None
    iucn_link: Optional[str] = None

class SpeciesProfileResponse(SpeciesProfileBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
