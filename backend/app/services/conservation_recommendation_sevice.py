from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.species import Species
from app.models.wildlife_observation import WildlifeObservation
from app.models.protected_area import ProtectedArea


def get_conservation_recommendations(db: Session):

    # Get observed species and their population
    species_data = (
        db.query(
            Species.id,
            Species.common_name,
            Species.scientific_name,
            Species.iucn_status,
            func.coalesce(
                func.sum(WildlifeObservation.animal_count),
                0
            ).label("population")
        )
        .outerjoin(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.id,
            Species.common_name,
            Species.scientific_name,
            Species.iucn_status
        )
        .all()
    )

    recommendations = []

    for species in species_data:

        status = (
            species.iucn_status or "Unknown"
        ).strip()

        status_lower = status.lower()

        population = int(species.population or 0)

        # =========================================
        # CRITICALLY ENDANGERED
        # =========================================

        if status_lower == "critically endangered":

            recommendations.append({
                "species_id": species.id,
                "species": species.common_name,
                "scientific_name": species.scientific_name,
                "status": status,
                "population": population,
                "priority": "Critical",
                "category": "Species Protection",
                "recommendation": (
                    f"Immediately increase monitoring and protection "
                    f"for {species.common_name}. Prioritize habitat "
                    f"protection, anti-poaching measures and population "
                    f"surveys."
                ),
                "actions": [
                    "Increase monitoring frequency",
                    "Strengthen habitat protection",
                    "Conduct population surveys",
                    "Assess major threats",
                    "Implement anti-poaching measures",
                ],
            })

        # =========================================
        # ENDANGERED
        # =========================================

        elif status_lower == "endangered":

            recommendations.append({
                "species_id": species.id,
                "species": species.common_name,
                "scientific_name": species.scientific_name,
                "status": status,
                "population": population,
                "priority": "High",
                "category": "Population Protection",
                "recommendation": (
                    f"Increase conservation monitoring for "
                    f"{species.common_name} and protect important habitat."
                ),
                "actions": [
                    "Increase population monitoring",
                    "Protect important habitat",
                    "Investigate population threats",
                    "Review conservation measures",
                ],
            })

        # =========================================
        # VULNERABLE
        # =========================================

        elif status_lower == "vulnerable":

            recommendations.append({
                "species_id": species.id,
                "species": species.common_name,
                "scientific_name": species.scientific_name,
                "status": status,
                "population": population,
                "priority": "Medium",
                "category": "Preventive Conservation",
                "recommendation": (
                    f"Monitor {species.common_name} closely to prevent "
                    f"further population decline."
                ),
                "actions": [
                    "Continue regular monitoring",
                    "Protect habitat",
                    "Monitor population changes",
                    "Identify emerging threats",
                ],
            })

        # =========================================
        # NEAR THREATENED
        # =========================================

        elif status_lower == "near threatened":

            recommendations.append({
                "species_id": species.id,
                "species": species.common_name,
                "scientific_name": species.scientific_name,
                "status": status,
                "population": population,
                "priority": "Low",
                "category": "Preventive Monitoring",
                "recommendation": (
                    f"Maintain regular monitoring of "
                    f"{species.common_name} and preserve its habitat."
                ),
                "actions": [
                    "Continue routine monitoring",
                    "Maintain habitat protection",
                    "Monitor population trend",
                ],
            })

    # =========================================
    # GENERAL ECOSYSTEM RECOMMENDATIONS
    # =========================================

    protected_area_count = (
        db.query(
            func.count(ProtectedArea.id)
        )
        .scalar()
        or 0
    )

    if protected_area_count == 0:

        recommendations.append({
            "species_id": None,
            "species": "Ecosystem",
            "scientific_name": None,
            "status": "Unknown",
            "population": 0,
            "priority": "High",
            "category": "Habitat Protection",
            "recommendation": (
                "No protected areas are currently recorded. "
                "Protected habitat should be established or added "
                "to the monitoring system."
            ),
            "actions": [
                "Identify important wildlife habitats",
                "Establish protected areas",
                "Add protected areas to the monitoring system",
            ],
        })

    # Critical first, then High, Medium, Low
    priority_order = {
        "Critical": 1,
        "High": 2,
        "Medium": 3,
        "Low": 4,
    }

    recommendations.sort(
        key=lambda x: priority_order.get(
            x["priority"],
            5
        )
    )

    return recommendations