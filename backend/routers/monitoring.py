from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date

from database import get_db
from models import MonitoringSystem


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/admin/monitoring",
    tags=["Admin Monitoring"]
)


# =========================================================
# PYDANTIC SCHEMAS
# =========================================================

class MonitoringSystemCreate(BaseModel):
    name: str
    type: str
    location: str
    status: str = "Active"
    last_monitored: date


class MonitoringSystemUpdate(BaseModel):
    name: str
    type: str
    location: str
    status: str
    last_monitored: date


class MonitoringStatusUpdate(BaseModel):
    status: str


# =========================================================
# GET ALL MONITORING SYSTEMS
# GET /admin/monitoring
# =========================================================

@router.get("")
def get_monitoring_systems(
    db: Session = Depends(get_db)
):
    systems = (
        db.query(MonitoringSystem)
        .order_by(MonitoringSystem.id.desc())
        .all()
    )

    return [
        {
            "id": system.id,
            "name": system.name,
            "type": system.type,
            "location": system.location,
            "status": system.status,
            "lastMonitored": (
                system.last_monitored.isoformat()
                if system.last_monitored
                else None
            ),
        }
        for system in systems
    ]


# =========================================================
# GET MONITORING STATISTICS
# GET /admin/monitoring/stats
# =========================================================

@router.get("/stats")
def get_monitoring_stats(
    db: Session = Depends(get_db)
):
    total_systems = (
        db.query(MonitoringSystem)
        .count()
    )

    active_systems = (
        db.query(MonitoringSystem)
        .filter(
            MonitoringSystem.status == "Active"
        )
        .count()
    )

    inactive_systems = (
        db.query(MonitoringSystem)
        .filter(
            MonitoringSystem.status == "Inactive"
        )
        .count()
    )

    camera_systems = (
        db.query(MonitoringSystem)
        .filter(
            MonitoringSystem.type == "Camera Trap"
        )
        .count()
    )

    return {
        "totalSystems": total_systems,
        "activeSystems": active_systems,
        "inactiveSystems": inactive_systems,
        "cameraSystems": camera_systems,
    }


# =========================================================
# ADD MONITORING SYSTEM
# POST /admin/monitoring
# =========================================================

@router.post("")
def create_monitoring_system(
    system_data: MonitoringSystemCreate,
    db: Session = Depends(get_db)
):

    system = MonitoringSystem(
        name=system_data.name,
        type=system_data.type,
        location=system_data.location,
        status=system_data.status,
        last_monitored=system_data.last_monitored,
    )

    db.add(system)
    db.commit()
    db.refresh(system)

    return {
        "message": "Monitoring system added successfully",
        "system": {
            "id": system.id,
            "name": system.name,
            "type": system.type,
            "location": system.location,
            "status": system.status,
            "lastMonitored": (
                system.last_monitored.isoformat()
                if system.last_monitored
                else None
            ),
        }
    }


# =========================================================
# UPDATE MONITORING SYSTEM
# PUT /admin/monitoring/{system_id}
# =========================================================

@router.put("/{system_id}")
def update_monitoring_system(
    system_id: int,
    system_data: MonitoringSystemUpdate,
    db: Session = Depends(get_db)
):

    system = (
        db.query(MonitoringSystem)
        .filter(
            MonitoringSystem.id == system_id
        )
        .first()
    )

    if not system:
        raise HTTPException(
            status_code=404,
            detail="Monitoring system not found"
        )

    system.name = system_data.name
    system.type = system_data.type
    system.location = system_data.location
    system.status = system_data.status
    system.last_monitored = system_data.last_monitored

    db.commit()
    db.refresh(system)

    return {
        "message": "Monitoring system updated successfully",
        "system": {
            "id": system.id,
            "name": system.name,
            "type": system.type,
            "location": system.location,
            "status": system.status,
            "lastMonitored": (
                system.last_monitored.isoformat()
                if system.last_monitored
                else None
            ),
        }
    }


# =========================================================
# DELETE MONITORING SYSTEM
# DELETE /admin/monitoring/{system_id}
# =========================================================

@router.delete("/{system_id}")
def delete_monitoring_system(
    system_id: int,
    db: Session = Depends(get_db)
):

    system = (
        db.query(MonitoringSystem)
        .filter(
            MonitoringSystem.id == system_id
        )
        .first()
    )

    if not system:
        raise HTTPException(
            status_code=404,
            detail="Monitoring system not found"
        )

    db.delete(system)
    db.commit()

    return {
        "message": "Monitoring system deleted successfully"
    }


# =========================================================
# UPDATE STATUS
# PUT /admin/monitoring/{system_id}/status
# =========================================================

@router.put("/{system_id}/status")
def update_monitoring_status(
    system_id: int,
    status_data: MonitoringStatusUpdate,
    db: Session = Depends(get_db)
):

    system = (
        db.query(MonitoringSystem)
        .filter(
            MonitoringSystem.id == system_id
        )
        .first()
    )

    if not system:
        raise HTTPException(
            status_code=404,
            detail="Monitoring system not found"
        )

    if status_data.status not in [
        "Active",
        "Inactive"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid monitoring status"
        )

    system.status = status_data.status

    db.commit()
    db.refresh(system)

    return {
        "message": "Monitoring system status updated successfully",
        "status": system.status
    }