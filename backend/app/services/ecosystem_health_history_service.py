from sqlalchemy.orm import Session

from app.models.ecosystem_health_history import (
    EcosystemHealthHistory,
)


def get_health_history(db: Session):

    history = (
        db.query(EcosystemHealthHistory)
        .order_by(
            EcosystemHealthHistory.created_at.asc()
        )
        .all()
    )

    # Keep only the latest record for each date
    daily_history = {}

    for item in history:
        date = item.created_at.strftime("%Y-%m-%d")

        daily_history[date] = {
            "date": date,
            "overall_score": item.overall_score,
            "biodiversity_score": item.biodiversity_score,
            "population_score": item.population_score,
            "habitat_score": item.habitat_score,
            "status": item.status,
        }

    return list(daily_history.values())


def save_health_history(
    db: Session,
    overall_score: float,
    biodiversity_score: float,
    population_score: float,
    habitat_score: float,
    status: str,
):

    history = EcosystemHealthHistory(
        overall_score=overall_score,
        biodiversity_score=biodiversity_score,
        population_score=population_score,
        habitat_score=habitat_score,
        status=status,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history