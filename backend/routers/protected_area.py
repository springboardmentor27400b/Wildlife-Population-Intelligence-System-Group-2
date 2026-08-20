from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from auth import get_current_user


router = APIRouter(
    prefix="/protected-areas",
    tags=["Protected Area Monitoring"]
)


# =========================================================
# PROTECTED AREA SUMMARY
# =========================================================

@router.get("/summary")
def protected_area_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    total_areas = (
        db.query(models.Survey.protected_area)
        .filter(
            models.Survey.protected_area.isnot(None)
        )
        .distinct()
        .count()
    )

    monitored_areas = (
        db.query(models.Survey.protected_area)
        .filter(
            models.Survey.protected_area.isnot(None)
        )
        .filter(
            models.Survey.status.in_([
                "Ongoing",
                "Active",
                "Completed"
            ])
        )
        .distinct()
        .count()
    )

    areas = (
        db.query(
            models.Survey.protected_area
        )
        .filter(
            models.Survey.protected_area.isnot(None)
        )
        .distinct()
        .all()
    )

    safe_areas = 0
    alert_areas = 0

    area_data = []

    for row in areas:

        area_name = row[0]

        surveys = (
            db.query(models.Survey)
            .filter(
                models.Survey.protected_area
                == area_name
            )
            .all()
        )

        has_alert = False

        for survey in surveys:

            incident_count = (
                db.query(models.Incident)
                .filter(
                    models.Incident.protected_area
                    == area_name
                )
                .filter(
                    models.Incident.status
                    != "RESOLVED"
                )
                .count()
            )

            if incident_count > 0:
                has_alert = True
                break

        if has_alert:
            alert_areas += 1
            status = "Alert"
        else:
            safe_areas += 1
            status = "Safe"

        area_data.append({
            "name": area_name,
            "status": status,
            "surveys": len(surveys)
        })

    return {
        "total_areas": total_areas,
        "monitored_areas": monitored_areas,
        "safe_areas": safe_areas,
        "alert_areas": alert_areas,
        "areas": area_data
    }