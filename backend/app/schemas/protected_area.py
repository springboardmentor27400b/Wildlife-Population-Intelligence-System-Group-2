from pydantic import BaseModel


class ProtectedAreaCreate(BaseModel):
    name: str
    state: str
    district: str
    area_type: str
    latitude: float
    longitude: float
    total_area_sqkm: float | None = None
    description: str | None = None


class ProtectedAreaResponse(ProtectedAreaCreate):
    id: int

    class Config:
        from_attributes = True