from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.elements import WKTElement
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.sql import MonitoringSite, User
from app.models.schemas import MonitoringSiteCreate, MonitoringSiteUpdate, MonitoringSiteResponse

router = APIRouter()

def serialize_site(site_record) -> MonitoringSiteResponse:
    # If it is a tuple returned from custom query
    if isinstance(site_record, tuple):
        return MonitoringSiteResponse(
            id=site_record.id,
            name=site_record.name,
            latitude=site_record.latitude,
            longitude=site_record.longitude,
            habitat_type=site_record.habitat_type,
            protected_area=site_record.protected_area,
            area_sq_km=getattr(site_record, "area_sq_km", 1.0) or 1.0,
            created_at=site_record.created_at
        )
    # If it is a model object
    from geoalchemy2.shape import to_shape
    shape = to_shape(site_record.location)
    return MonitoringSiteResponse(
        id=site_record.id,
        name=site_record.name,
        latitude=shape.y,
        longitude=shape.x,
        habitat_type=site_record.habitat_type,
        protected_area=site_record.protected_area,
        area_sq_km=getattr(site_record, "area_sq_km", 1.0) or 1.0,
        created_at=site_record.created_at
    )

@router.post("/", response_model=MonitoringSiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    site_in: MonitoringSiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Researcher", "Admin"]))
):
    # Construct WKT location point
    wkt_location = f"POINT({site_in.longitude} {site_in.latitude})"
    db_site = MonitoringSite(
        name=site_in.name,
        location=WKTElement(wkt_location, srid=4326),
        habitat_type=site_in.habitat_type,
        protected_area=site_in.protected_area,
        area_sq_km=site_in.area_sq_km if site_in.area_sq_km is not None else 1.0
    )
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return serialize_site(db_site)

@router.get("/", response_model=list[MonitoringSiteResponse])
def list_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sites = db.query(MonitoringSite).all()
    return [serialize_site(s) for s in sites]

@router.get("/{site_id}", response_model=MonitoringSiteResponse)
def get_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(MonitoringSite).filter(MonitoringSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring site not found")
    return serialize_site(site)

@router.put("/{site_id}", response_model=MonitoringSiteResponse)
def update_site(
    site_id: int,
    site_in: MonitoringSiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Researcher", "Admin"]))
):
    db_site = db.query(MonitoringSite).filter(MonitoringSite.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring site not found")
    
    if site_in.name is not None:
        db_site.name = site_in.name
    if site_in.habitat_type is not None:
        db_site.habitat_type = site_in.habitat_type
    if site_in.protected_area is not None:
        db_site.protected_area = site_in.protected_area
    if site_in.area_sq_km is not None:
        db_site.area_sq_km = site_in.area_sq_km
        
    if site_in.latitude is not None or site_in.longitude is not None:
        # Resolve coords
        from geoalchemy2.shape import to_shape
        shape = to_shape(db_site.location)
        new_lat = site_in.latitude if site_in.latitude is not None else shape.y
        new_lng = site_in.longitude if site_in.longitude is not None else shape.x
        db_site.location = WKTElement(f"POINT({new_lng} {new_lat})", srid=4326)
        
    db.commit()
    db.refresh(db_site)
    return serialize_site(db_site)

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"]))
):
    db_site = db.query(MonitoringSite).filter(MonitoringSite.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring site not found")
    
    # Check if there are dependent devices or observations
    # For now, cascading is handled or restricted
    db.delete(db_site)
    db.commit()
    return None
