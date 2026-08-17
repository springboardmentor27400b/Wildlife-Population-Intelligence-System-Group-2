from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.dependencies import get_current_user
from app.role_checker import require_role
router = APIRouter(
    prefix="/monitoring",
    tags=["Monitoring Sites"]
)


@router.post("/", response_model=schemas.MonitoringSiteResponse)
def create_monitoring_site(
    site: schemas.MonitoringSiteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
    require_role(["Admin", "Forest Officer"])
    )
):
    return crud.create_monitoring_site(db, site)


@router.get("/", response_model=list[schemas.MonitoringSiteResponse])
def get_monitoring_sites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_monitoring_sites(db)


@router.get("/{site_id}", response_model=schemas.MonitoringSiteResponse)
def get_monitoring_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    site = crud.get_monitoring_site(db, site_id)

    if not site:
        raise HTTPException(
            status_code=404,
            detail="Monitoring Site not found"
        )

    return site


@router.put("/{site_id}", response_model=schemas.MonitoringSiteResponse)
def update_monitoring_site(
    site_id: int,
    site: schemas.MonitoringSiteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
    require_role(["Admin", "Forest Officer"])
    )
):
    updated = crud.update_monitoring_site(db, site_id, site)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Monitoring Site not found"
        )

    return updated


@router.delete("/{site_id}")
def delete_monitoring_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
    require_role(["Admin", "Forest Officer"])

    )
):
    deleted = crud.delete_monitoring_site(db, site_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Monitoring Site not found"
        )

    return {
        "message": "Monitoring Site deleted successfully"
    }