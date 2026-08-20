from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

import models
import schemas
from database import get_db
from auth import get_current_user


router = APIRouter(
    prefix="/patrols",
    tags=["Patrol Planning"]
)


# =========================================================
# GET PATROL SUMMARY
# =========================================================

@router.get("/summary")
def patrol_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    planned_patrols = (
        db.query(models.Patrol)
        .filter(
            models.Patrol.status == "Planned"
        )
        .count()
    )

    patrol_routes = (
        db.query(models.Patrol.route)
        .filter(
            models.Patrol.route.isnot(None)
        )
        .distinct()
        .count()
    )

    patrol_teams = (
        db.query(models.Patrol.team_name)
        .filter(
            models.Patrol.team_name.isnot(None)
        )
        .distinct()
        .count()
    )

    completed_patrols = (
        db.query(models.Patrol)
        .filter(
            models.Patrol.status == "Completed"
        )
        .count()
    )

    patrols = (
        db.query(models.Patrol)
        .order_by(
            models.Patrol.patrol_date.asc()
        )
        .all()
    )

    data = []

    for patrol in patrols:

        data.append({
            "id": patrol.id,
            "patrol_name": patrol.patrol_name,
            "patrol_date": patrol.patrol_date,
            "protected_area": patrol.protected_area,
            "route": patrol.route,
            "team_name": patrol.team_name,
            "team_members": patrol.team_members,
            "status": patrol.status,
            "notes": patrol.notes
        })

    return {
        "planned_patrols": planned_patrols,
        "patrol_routes": patrol_routes,
        "patrol_teams": patrol_teams,
        "completed_patrols": completed_patrols,
        "patrols": data
    }

# =========================================================
# GET ALL PATROLS
# =========================================================

@router.get("")
def get_patrols(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    patrols = (
        db.query(models.Patrol)
        .order_by(
            models.Patrol.patrol_date.asc()
        )
        .all()
    )

    return [
        {
            "id": patrol.id,
            "patrol_name": patrol.patrol_name,
            "patrol_date": patrol.patrol_date,
            "protected_area": patrol.protected_area,
            "route": patrol.route,
            "team_name": patrol.team_name,
            "team_members": patrol.team_members,
            "status": patrol.status,
            "notes": patrol.notes,
        }
        for patrol in patrols
    ]

# =========================================================
# CREATE PATROL
# =========================================================

@router.post("")
def create_patrol(
    patrol_data: schemas.PatrolCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    patrol = models.Patrol(
        patrol_name=patrol_data.patrol_name,
        patrol_date=patrol_data.patrol_date,
        protected_area=patrol_data.protected_area,
        route=patrol_data.route,
        team_name=patrol_data.team_name,
        team_members=patrol_data.team_members,
        status=patrol_data.status,
        notes=patrol_data.notes,
        created_by=current_user.id
    )

    db.add(patrol)
    db.commit()
    db.refresh(patrol)

    return {
        "message": "Patrol created successfully",
        "patrol": {
            "id": patrol.id,
            "patrol_name": patrol.patrol_name,
            "patrol_date": patrol.patrol_date,
            "protected_area": patrol.protected_area,
            "route": patrol.route,
            "team_name": patrol.team_name,
            "team_members": patrol.team_members,
            "status": patrol.status,
            "notes": patrol.notes
        }
    }


# =========================================================
# UPDATE PATROL STATUS
# =========================================================

@router.patch("/{patrol_id}/status")
def update_patrol_status(
    patrol_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    patrol = (
        db.query(models.Patrol)
        .filter(
            models.Patrol.id == patrol_id
        )
        .first()
    )

    if not patrol:
        raise HTTPException(
            status_code=404,
            detail="Patrol not found"
        )

    patrol.status = status

    db.commit()
    db.refresh(patrol)

    return {
        "message": "Patrol status updated",
        "status": patrol.status
    }