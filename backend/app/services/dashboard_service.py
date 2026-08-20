from sqlalchemy.orm import Session
from app.models.user import User
from app.models.species import Species
from app.models.protected_area import ProtectedArea
from app.models.wildlife_observation import WildlifeObservation


def get_dashboard_stats(db: Session):
    return {
        "total_users": db.query(User).count(),
        "total_species": db.query(Species).count(),
        "total_protected_areas": db.query(ProtectedArea).count(),
        "total_observations": db.query(WildlifeObservation).count(),
    }