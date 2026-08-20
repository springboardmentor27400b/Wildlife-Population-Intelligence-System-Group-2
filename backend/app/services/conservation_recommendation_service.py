from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.species import Species
from app.models.wildlife_observation import WildlifeObservation
from app.models.protected_area import ProtectedArea


# ============================================================
# CONSERVATION RECOMMENDATION ENGINE
# ============================================================

def get_conservation_recommendations(db: Session):

    # --------------------------------------------------------
    # 1. LOAD SPECIES + OBSERVATION DATA
    # --------------------------------------------------------

    rows = (
        db.query(
            Species.id,
            Species.common_name,
            Species.scientific_name,
            Species.iucn_status,
            WildlifeObservation.animal_count,
            WildlifeObservation.observation_date,
            WildlifeObservation.protected_area_id,
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id,
        )
        .order_by(
            WildlifeObservation.observation_date.asc()
        )
        .all()
    )

    # --------------------------------------------------------
    # NO DATA
    # --------------------------------------------------------

    if not rows:

        return {
            "summary": {
                "total_recommendations": 0,
                "high_priority": 0,
                "medium_priority": 0,
                "low_priority": 0,
            },
            "recommendations": [],
        }

    # --------------------------------------------------------
    # 2. BUILD SPECIES ANALYSIS
    # --------------------------------------------------------

    species_data = defaultdict(
        lambda: {
            "id": None,
            "species": "Unknown",
            "scientific_name": None,
            "status": "Unknown",
            "observations": [],
            "population": 0,
            "observation_count": 0,
            "protected_areas": set(),
        }
    )

    for row in rows:

        data = species_data[row.id]

        data["id"] = row.id
        data["species"] = row.common_name or "Unknown"
        data["scientific_name"] = row.scientific_name
        data["status"] = (
            row.iucn_status or "Unknown"
        ).strip()

        animal_count = int(
            row.animal_count or 0
        )

        data["population"] += animal_count
        data["observation_count"] += 1

        data["observations"].append(
            {
                "date": row.observation_date,
                "count": animal_count,
            }
        )

        if row.protected_area_id is not None:
            data["protected_areas"].add(
                row.protected_area_id
            )

    # --------------------------------------------------------
    # 3. CALCULATE SPECIES TRENDS
    # --------------------------------------------------------

    analyzed_species = []

    for data in species_data.values():

        observations = data["observations"]

        first_count = (
            observations[0]["count"]
            if observations
            else 0
        )

        last_count = (
            observations[-1]["count"]
            if observations
            else 0
        )

        if first_count > 0:

            change_percent = (
                (last_count - first_count)
                / first_count
            ) * 100

        else:

            change_percent = 0

        change_percent = round(
            change_percent,
            2
        )

        if change_percent < -10:
            trend = "Declining"

        elif change_percent > 10:
            trend = "Increasing"

        else:
            trend = "Stable"

        data["first_count"] = first_count
        data["last_count"] = last_count
        data["change_percent"] = change_percent
        data["trend"] = trend

        analyzed_species.append(data)

    # --------------------------------------------------------
    # 4. PROTECTED AREA ANALYSIS
    # --------------------------------------------------------

    area_rows = (
        db.query(
            ProtectedArea.id,
            ProtectedArea.name,
            ProtectedArea.area_type,
            WildlifeObservation.animal_count,
            WildlifeObservation.species_id,
        )
        .outerjoin(
            WildlifeObservation,
            WildlifeObservation.protected_area_id
            == ProtectedArea.id,
        )
        .all()
    )

    area_data = defaultdict(
        lambda: {
            "id": None,
            "area": "Unknown",
            "habitat": "Unknown",
            "animals": 0,
            "species": set(),
            "observations": 0,
        }
    )

    for row in area_rows:

        data = area_data[row.id]

        data["id"] = row.id
        data["area"] = row.name or "Unknown"
        data["habitat"] = (
            row.area_type or "Unknown"
        )

        if row.animal_count is not None:

            data["animals"] += int(
                row.animal_count or 0
            )

            data["observations"] += 1

        if row.species_id is not None:

            data["species"].add(
                row.species_id
            )

    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    recommendations = []

    # ========================================================
    # A. CONSERVATION PRIORITY RECOMMENDATIONS
    # ========================================================

    for species in analyzed_species:

        status = species["status"].lower()

        if status == "critically endangered":

            recommendations.append(
                {
                    "id": f"priority-{species['id']}",
                    "category": "Conservation Priority",
                    "priority": "Critical",
                    "title": (
                        f"Immediate protection for "
                        f"{species['species']}"
                    ),
                    "detail": (
                        f"{species['species']} is classified "
                        f"as Critically Endangered. "
                        f"Immediate conservation attention "
                        f"and population monitoring are "
                        f"recommended."
                    ),
                    "species": species["species"],
                    "scientific_name": species[
                        "scientific_name"
                    ],
                    "status": species["status"],
                    "trend": species["trend"],
                    "impact": 100,
                }
            )

        elif status == "endangered":

            recommendations.append(
                {
                    "id": f"priority-{species['id']}",
                    "category": "Conservation Priority",
                    "priority": "High",
                    "title": (
                        f"Prioritize {species['species']} "
                        f"for conservation"
                    ),
                    "detail": (
                        f"{species['species']} is classified "
                        f"as Endangered. Increase protection "
                        f"and monitoring activities."
                    ),
                    "species": species["species"],
                    "scientific_name": species[
                        "scientific_name"
                    ],
                    "status": species["status"],
                    "trend": species["trend"],
                    "impact": 90,
                }
            )

        elif status == "vulnerable":

            recommendations.append(
                {
                    "id": f"priority-{species['id']}",
                    "category": "Conservation Priority",
                    "priority": "Medium",
                    "title": (
                        f"Monitor {species['species']} "
                        f"closely"
                    ),
                    "detail": (
                        f"{species['species']} is classified "
                        f"as Vulnerable. Maintain regular "
                        f"population monitoring and habitat "
                        f"protection."
                    ),
                    "species": species["species"],
                    "scientific_name": species[
                        "scientific_name"
                    ],
                    "status": species["status"],
                    "trend": species["trend"],
                    "impact": 70,
                }
            )

    # ========================================================
    # B. POPULATION DECLINE RECOMMENDATIONS
    # ========================================================

    for species in analyzed_species:

        if species["trend"] == "Declining":

            priority = (
                "Critical"
                if species["status"].lower()
                == "critically endangered"
                else "High"
            )

            impact = 95 if priority == "Critical" else 85

            recommendations.append(
                {
                    "id": f"decline-{species['id']}",
                    "category": "Wildlife Protection",
                    "priority": priority,
                    "title": (
                        f"Investigate declining "
                        f"population of "
                        f"{species['species']}"
                    ),
                    "detail": (
                        f"Observed population has declined "
                        f"by approximately "
                        f"{abs(species['change_percent'])}% "
                        f"between the earliest and latest "
                        f"available observations. "
                        f"Investigate possible threats."
                    ),
                    "species": species["species"],
                    "scientific_name": species[
                        "scientific_name"
                    ],
                    "status": species["status"],
                    "trend": species["trend"],
                    "change_percent": species[
                        "change_percent"
                    ],
                    "impact": impact,
                }
            )

    # ========================================================
    # C. MONITORING OPTIMIZATION
    # ========================================================

    for species in analyzed_species:

        if species["trend"] == "Declining":

            recommendations.append(
                {
                    "id": f"monitor-{species['id']}",
                    "category": "Monitoring Optimization",
                    "priority": "High",
                    "title": (
                        f"Increase monitoring for "
                        f"{species['species']}"
                    ),
                    "detail": (
                        f"Increase observation frequency "
                        f"for {species['species']} because "
                        f"the population trend is declining."
                    ),
                    "species": species["species"],
                    "scientific_name": species[
                        "scientific_name"
                    ],
                    "status": species["status"],
                    "trend": species["trend"],
                    "recommended_action": (
                        "Increase monitoring frequency"
                    ),
                    "impact": 85,
                }
            )

        elif species["observation_count"] <= 2:

            recommendations.append(
                {
                    "id": f"monitor-{species['id']}",
                    "category": "Monitoring Optimization",
                    "priority": "Medium",
                    "title": (
                        f"Collect more observations "
                        f"for {species['species']}"
                    ),
                    "detail": (
                        f"Only "
                        f"{species['observation_count']} "
                        f"observation(s) are currently "
                        f"available. Additional monitoring "
                        f"would improve population assessment."
                    ),
                    "species": species["species"],
                    "scientific_name": species[
                        "scientific_name"
                    ],
                    "status": species["status"],
                    "trend": species["trend"],
                    "recommended_action": (
                        "Increase observation coverage"
                    ),
                    "impact": 65,
                }
            )

    # ========================================================
    # D. HABITAT RESTORATION SUGGESTIONS
    # ========================================================

    for area in area_data.values():

        species_count = len(
            area["species"]
        )

        # A protected area with low observed
        # species richness should receive
        # habitat assessment attention.

        if area["id"] is not None and species_count < 3:

            recommendations.append(
                {
                    "id": f"habitat-{area['id']}",
                    "category": "Habitat Restoration",
                    "priority": "Medium",
                    "title": (
                        f"Assess habitat restoration "
                        f"needs in {area['area']}"
                    ),
                    "detail": (
                        f"{area['area']} currently has "
                        f"{species_count} observed species. "
                        f"Conduct habitat condition assessment "
                        f"and evaluate restoration opportunities."
                    ),
                    "protected_area": area["area"],
                    "habitat": area["habitat"],
                    "species_count": species_count,
                    "impact": 70,
                }
            )

    # ========================================================
    # E. RESOURCE ALLOCATION
    # ========================================================

    ranked_areas = sorted(
        area_data.values(),
        key=lambda item: (
            len(item["species"]),
            item["animals"],
        ),
        reverse=True,
    )

    for index, area in enumerate(
        ranked_areas[:5]
    ):

        if area["id"] is None:
            continue

        if index == 0:

            priority = "High"
            impact = 90

        elif index <= 2:

            priority = "Medium"
            impact = 75

        else:

            priority = "Low"
            impact = 60

        recommendations.append(
            {
                "id": f"resource-{area['id']}",
                "category": "Resource Allocation",
                "priority": priority,
                "title": (
                    f"Prioritize conservation resources "
                    f"for {area['area']}"
                ),
                "detail": (
                    f"{area['area']} supports approximately "
                    f"{len(area['species'])} observed species "
                    f"and {area['animals']} observed animals. "
                    f"Consider this area when allocating "
                    f"monitoring and conservation resources."
                ),
                "protected_area": area["area"],
                "habitat": area["habitat"],
                "species_count": len(
                    area["species"]
                ),
                "population": area["animals"],
                "impact": impact,
            }
        )

    # ========================================================
    # F. SORT RECOMMENDATIONS
    # ========================================================

    priority_order = {
        "Critical": 0,
        "High": 1,
        "Medium": 2,
        "Low": 3,
    }

    recommendations.sort(
        key=lambda item: (
            priority_order.get(
                item["priority"],
                99
            ),
            -item["impact"],
        )
    )

    # ========================================================
    # SUMMARY
    # ========================================================

    critical_count = sum(
        1
        for item in recommendations
        if item["priority"] == "Critical"
    )

    high_count = sum(
        1
        for item in recommendations
        if item["priority"] == "High"
    )

    medium_count = sum(
        1
        for item in recommendations
        if item["priority"] == "Medium"
    )

    low_count = sum(
        1
        for item in recommendations
        if item["priority"] == "Low"
    )

    return {
        "summary": {
            "total_recommendations": len(
                recommendations
            ),
            "critical": critical_count,
            "high_priority": high_count,
            "medium_priority": medium_count,
            "low_priority": low_count,
        },
        "recommendations": recommendations,
    }