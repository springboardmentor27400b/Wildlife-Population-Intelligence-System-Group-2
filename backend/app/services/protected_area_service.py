from sqlalchemy.orm import Session

from app.models.protected_area import ProtectedArea
from app.schemas.protected_area import ProtectedAreaCreate


def create_protected_area(db: Session, area: ProtectedAreaCreate):
    existing = (
        db.query(ProtectedArea)
        .filter(ProtectedArea.name == area.name)
        .first()
    )

    if existing:
        return None

    new_area = ProtectedArea(
        name=area.name,
        state=area.state,
        district=area.district,
        area_type=area.area_type,
        latitude=area.latitude,
        longitude=area.longitude,
        total_area_sqkm=area.total_area_sqkm,
        description=area.description,
    )

    db.add(new_area)
    db.commit()
    db.refresh(new_area)

    return new_area


def get_all_protected_areas(db: Session):
    return (
        db.query(ProtectedArea)
        .order_by(ProtectedArea.name)
        .all()
    )


def get_protected_area_by_id(db: Session, area_id: int):
    return (
        db.query(ProtectedArea)
        .filter(ProtectedArea.id == area_id)
        .first()
    )