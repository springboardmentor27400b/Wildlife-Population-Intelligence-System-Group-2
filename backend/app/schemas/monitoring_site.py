from pydantic import BaseModel


class MonitoringSiteCreate(BaseModel):
    site_name: str
    latitude: float
    longitude: float
    habitat: str
    country: str


class MonitoringSiteOut(BaseModel):
    id: int
    site_name: str
    latitude: float
    longitude: float
    habitat: str
    country: str
