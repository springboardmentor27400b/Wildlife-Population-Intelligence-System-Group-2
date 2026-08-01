from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.monitoring_site import MonitoringSite
from app.models.user import User
from app.schemas.monitoring_site import MonitoringSiteCreate, MonitoringSiteOut

router = APIRouter(tags=["monitoring-sites"])


@router.post("/monitoring-site", response_model=MonitoringSiteOut)
def create_monitoring_site(site_data: MonitoringSiteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MonitoringSiteOut:
    site = MonitoringSite(**site_data.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return MonitoringSiteOut(id=site.id, site_name=site.site_name, latitude=site.latitude, longitude=site.longitude, habitat=site.habitat, country=site.country)


@router.get("/monitoring-site", response_model=list[MonitoringSiteOut])
def list_monitoring_sites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[MonitoringSiteOut]:
    sites = db.query(MonitoringSite).all()
    return [MonitoringSiteOut(id=site.id, site_name=site.site_name, latitude=site.latitude, longitude=site.longitude, habitat=site.habitat, country=site.country) for site in sites]
