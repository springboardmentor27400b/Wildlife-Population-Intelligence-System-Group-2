from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

import models
import schemas
from database import get_db
from auth import get_current_user


router = APIRouter(
    prefix="/incidents",
    tags=["Incident Reports"]
)


# =========================================================
# GET INCIDENT SUMMARY
# =========================================================

@router.get("/summary")
def incident_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    total_incidents = (
        db.query(models.Incident).count()
    )

    open_incidents = (
        db.query(models.Incident)
        .filter(
            models.Incident.status == "OPEN"
        )
        .count()
    )

    investigating = (
        db.query(models.Incident)
        .filter(
            models.Incident.status == "UNDER_INVESTIGATION"
        )
        .count()
    )

    resolved = (
        db.query(models.Incident)
        .filter(
            models.Incident.status == "RESOLVED"
        )
        .count()
    )

    return {
        "total_incidents": total_incidents,
        "open_incidents": open_incidents,
        "under_investigation": investigating,
        "resolved_incidents": resolved
    }


# =========================================================
# GET ALL INCIDENTS
# =========================================================

@router.get("")
def get_incidents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    incidents = (
        db.query(models.Incident)
        .order_by(
            models.Incident.reported_at.desc()
        )
        .all()
    )

    return [
        {
            "id": incident.id,
            "incident_type": incident.incident_type,
            "title": incident.title,
            "description": incident.description,
            "protected_area": incident.protected_area,
            "location": incident.location,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "severity": incident.severity,
            "status": incident.status,
            "reported_at": incident.reported_at,
            "resolved_at": incident.resolved_at,
            "notes": incident.notes
        }
        for incident in incidents
    ]


# =========================================================
# REPORT INCIDENT
# =========================================================

@router.post("")
def report_incident(
    incident_data: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    try:

        incident = models.Incident(
            incident_type=incident_data.incident_type,
            title=incident_data.title,
            description=incident_data.description,
            protected_area=incident_data.protected_area,
            location=incident_data.location,
            latitude=incident_data.latitude,
            longitude=incident_data.longitude,
            severity=incident_data.severity,
            status=incident_data.status,
            reported_by=current_user.id,
            notes=incident_data.notes
        )

        db.add(incident)
        db.commit()
        db.refresh(incident)

        return {
            "message": "Incident reported successfully",
            "incident": {
                "id": incident.id,
                "incident_type": incident.incident_type,
                "title": incident.title,
                "description": incident.description,
                "protected_area": incident.protected_area,
                "location": incident.location,
                "latitude": incident.latitude,
                "longitude": incident.longitude,
                "severity": incident.severity,
                "status": incident.status,
                "reported_at": incident.reported_at,
                "notes": incident.notes
            }
        }

    except Exception as e:

        db.rollback()

        print("INCIDENT CREATE ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Unable to create incident: {str(e)}"
        )


# =========================================================
# UPDATE INCIDENT STATUS
# =========================================================

@router.patch("/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    allowed_statuses = [
        "OPEN",
        "UNDER_INVESTIGATION",
        "RESOLVED"
    ]

    status = status.strip().upper()

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid incident status"
        )

    incident = (
        db.query(models.Incident)
        .filter(
            models.Incident.id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident.status = status

    if status == "RESOLVED":
        incident.resolved_at = datetime.utcnow()
    else:
        incident.resolved_at = None

    db.commit()
    db.refresh(incident)

    return {
        "message": "Incident status updated",
        "status": incident.status
    }