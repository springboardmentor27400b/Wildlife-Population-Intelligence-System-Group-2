from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.habitat_service import get_habitat_summary, get_habitat_risk, get_habitat_map

router = APIRouter(tags=["habitat"])

@router.get("/habitat")
@router.get("/habitat/")
@router.get("/habitats")
@router.get("/habitats/")
def get_habitats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_habitat_summary(db).get("habitats", [])

@router.get("/habitat/dashboard")
@router.get("/habitats/dashboard")
@router.get("/habitat/summary")
@router.get("/habitats/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_habitat_summary(db)

@router.get("/habitat/risk")
@router.get("/habitats/risk")
def get_risk(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_habitat_risk(db)

@router.get("/habitat/analytics")
@router.get("/habitats/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.habitat import HabitatAnalytics
    analytics = db.query(HabitatAnalytics).all()
    if analytics:
        return [
            {
                "id": a.id,
                "habitat_name": a.habitat_name,
                "habitat_quality": a.habitat_quality,
                "vegetation_score": a.vegetation_score,
                "water_score": a.water_score,
                "food_availability": a.food_availability,
                "human_disturbance": a.human_disturbance,
                "biodiversity_index": a.biodiversity_index,
                "climate_score": a.climate_score,
                "carrying_capacity": a.carrying_capacity,
                "habitat_health": a.habitat_health,
                "risk_level": a.risk_level,
                "recommendation": a.recommendation,
                "updated_at": str(a.updated_at) if a.updated_at else None
            }
            for a in analytics
        ]
    return get_habitat_summary(db).get("habitats", [])

@router.get("/habitat/map")
@router.get("/habitats/map")
def get_map(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_habitat_map(db)
