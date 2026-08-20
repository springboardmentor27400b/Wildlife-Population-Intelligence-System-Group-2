from pydantic import BaseModel


class SpeciesCreate(BaseModel):
    common_name: str
    scientific_name: str
    category: str
    iucn_status: str
    description: str | None = None


class SpeciesResponse(BaseModel):
    id: int
    common_name: str
    scientific_name: str
    category: str
    iucn_status: str
    description: str | None

    class Config:
        from_attributes = True