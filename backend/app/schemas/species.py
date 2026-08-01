from pydantic import BaseModel


class SpeciesOut(BaseModel):
    id: int
    common_name: str
    scientific_name: str
    category: str
    iucn_status: str
