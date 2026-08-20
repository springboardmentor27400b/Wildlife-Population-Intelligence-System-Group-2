from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.protected_area import ProtectedArea
from app.models.wildlife_observation import WildlifeObservation


def protected_area_analytics(db: Session):

    result = (
        db.query(
            ProtectedArea.name,
            ProtectedArea.area_type,
            func.count(WildlifeObservation.id),
            func.sum(WildlifeObservation.animal_count),
        )
        .outerjoin(
            WildlifeObservation,
            WildlifeObservation.protected_area_id == ProtectedArea.id
        )
        .group_by(
            ProtectedArea.id
        )
        .all()
    )

    data = []

    for area in result:

        data.append({

            "name": area[0],

            "type": area[1],

            "observations": int(area[2] or 0),

            "animals": int(area[3] or 0)

        })

    return data