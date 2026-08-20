from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.wildlife_observation import WildlifeObservation


def get_population_growth(db: Session):

    observations = (
        db.query(
            func.date(WildlifeObservation.observation_date).label("date"),
            func.sum(WildlifeObservation.animal_count).label("population"),
        )
        .group_by(
            func.date(WildlifeObservation.observation_date)
        )
        .order_by(
            func.date(WildlifeObservation.observation_date)
        )
        .all()
    )

    if len(observations) < 2:
        return {
            "previous_population": 0,
            "current_population": 0,
            "growth_rate": 0,
            "trend": "Insufficient Data",
        }

    previous_population = int(observations[-2].population or 0)
    current_population = int(observations[-1].population or 0)

    if previous_population == 0:
        growth_rate = 0
    else:
        growth_rate = round(
            (
                (current_population - previous_population)
                / previous_population
            )
            * 100,
            2,
        )

    if growth_rate > 10:
        trend = "Increasing"
    elif growth_rate < -10:
        trend = "Declining"
    else:
        trend = "Stable"

    return {
        "previous_population": previous_population,
        "current_population": current_population,
        "growth_rate": growth_rate,
        "trend": trend,
    }