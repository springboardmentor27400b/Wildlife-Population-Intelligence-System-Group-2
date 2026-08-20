from collections import defaultdict

from app.models.wildlife import Wildlife


async def get_conservation_priority_recommendations():
    """
    Analyze all wildlife records and recommend
    conservation priorities for each species.
    """

    records = await Wildlife.find_all().to_list()

    if not records:
        return {
            "total_species": 0,
            "recommendations": [],
        }

    species_data = defaultdict(
        lambda: {
            "population": 0,
            "locations": set(),
            "status": "Not Evaluated",
        }
    )

    for record in records:

        species = record.species_name.strip().title()

        species_data[species]["population"] += (
            record.count if record.count else 0
        )

        if record.location:
            species_data[species]["locations"].add(
                record.location
            )

        if (
            record.conservation_status
            and record.conservation_status != "Not Evaluated"
        ):
            species_data[species]["status"] = (
                record.conservation_status
            )

    recommendations = []

    for species, data in species_data.items():

        population = data["population"]
        locations = len(data["locations"])
        status = data["status"]

        score = 0
        reasons = []

        # -------------------------------------
        # Population
        # -------------------------------------

        if population <= 5:
            score += 35
            reasons.append("Very low population")

        elif population <= 20:
            score += 20
            reasons.append("Low population")

        # -------------------------------------
        # Distribution
        # -------------------------------------

        if locations == 1:
            score += 20
            reasons.append("Limited distribution")

        # -------------------------------------
        # Conservation Status
        # -------------------------------------

        if status == "Endangered":
            score += 40
            reasons.append("Endangered species")

        elif status == "Vulnerable":
            score += 25
            reasons.append("Vulnerable species")

        elif status == "Near Threatened":
            score += 15
            reasons.append("Near threatened species")

        # -------------------------------------
        # Priority
        # -------------------------------------

        if score >= 70:

            priority = "Critical"

            recommendation = (
                "Immediate conservation action, "
                "increase habitat protection and monitoring."
            )

        elif score >= 50:

            priority = "High"

            recommendation = (
                "Increase field monitoring and "
                "strengthen habitat management."
            )

        elif score >= 30:

            priority = "Medium"

            recommendation = (
                "Continue regular monitoring and "
                "population assessment."
            )

        else:

            priority = "Low"

            recommendation = (
                "Maintain current conservation practices."
            )

        recommendations.append({

            "species": species,

            "population": population,

            "conservation_status": status,

            "priority": priority,

            "priority_score": score,

            "reason": reasons,

            "recommendation": recommendation,

        })

    recommendations.sort(
        key=lambda x: x["priority_score"],
        reverse=True,
    )

    return {

        "total_species": len(recommendations),

        "recommendations": recommendations,

    }

# ============================================================
# 9.2 HABITAT RESTORATION SUGGESTIONS
# ============================================================

from app.models.habitat import Habitat


async def get_habitat_restoration_suggestions():

    habitats = await Habitat.find_all().to_list()

    if not habitats:
        return {
            "total_locations": 0,
            "restoration_recommendations": [],
        }

    recommendations = []

    for habitat in habitats:

        issues = []

        actions = []

        priority_score = 0

        vegetation = habitat.vegetation_health or 0

        water = habitat.water_quality or 0

        suitability = (
            habitat.habitat_suitability_score
            if hasattr(habitat, "habitat_suitability_score")
            else None
        )

        # ------------------------------------------
        # Vegetation
        # ------------------------------------------

        if vegetation < 50:

            priority_score += 30

            issues.append("Poor vegetation health")

            actions.append(
                "Restore native vegetation and prevent deforestation."
            )

        elif vegetation < 75:

            priority_score += 15

            issues.append("Moderate vegetation health")

            actions.append(
                "Increase plantation of native species."
            )

        # ------------------------------------------
        # Water Quality
        # ------------------------------------------

        if water < 50:

            priority_score += 30

            issues.append("Poor water quality")

            actions.append(
                "Improve water sources and reduce pollution."
            )

        elif water < 75:

            priority_score += 15

            issues.append("Moderate water quality")

            actions.append(
                "Regular monitoring of water bodies."
            )

        # ------------------------------------------
        # Protected Area
        # ------------------------------------------

        if not habitat.protected_area:

            priority_score += 20

            issues.append("Area not protected")

            actions.append(
                "Consider declaring this area protected."
            )

        # ------------------------------------------
        # Habitat Suitability
        # ------------------------------------------

        if suitability is not None:

            if suitability < 50:

                priority_score += 20

                issues.append("Low habitat suitability")

                actions.append(
                    "Improve environmental conditions."
                )

        # ------------------------------------------
        # Priority
        # ------------------------------------------

        if priority_score >= 60:

            priority = "High"

        elif priority_score >= 30:

            priority = "Medium"

        else:

            priority = "Low"

        # ------------------------------------------
        # Default
        # ------------------------------------------

        if not actions:

            actions.append(
                "Maintain current habitat management practices."
            )

        recommendations.append({

            "location": habitat.location,

            "habitat_type": habitat.habitat_type,

            "priority": priority,

            "priority_score": priority_score,

            "issues": issues,

            "recommended_actions": actions,

            "estimated_impact":
                "Improved habitat quality and biodiversity",

        })

    recommendations.sort(

        key=lambda x: x["priority_score"],

        reverse=True

    )

    return {

        "total_locations": len(recommendations),

        "restoration_recommendations": recommendations,

    }

# ============================================================
# 9.3 WILDLIFE PROTECTION STRATEGIES
# ============================================================

from collections import defaultdict

from app.models.wildlife import Wildlife


async def get_wildlife_protection_strategies():

    records = await Wildlife.find_all().to_list()

    if not records:
        return {
            "total_species": 0,
            "protection_strategies": [],
        }

    species_data = defaultdict(
        lambda: {
            "population": 0,
            "locations": set(),
            "status": "Not Evaluated",
        }
    )

    for record in records:

        species = record.species_name.strip().title()

        species_data[species]["population"] += (
            record.count if record.count else 0
        )

        if record.location:
            species_data[species]["locations"].add(
                record.location
            )

        if (
            record.conservation_status
            and record.conservation_status != "Not Evaluated"
        ):
            species_data[species]["status"] = (
                record.conservation_status
            )

    strategies = []

    for species, data in species_data.items():

        population = data["population"]

        locations = len(data["locations"])

        status = data["status"]

        actions = []

        # -----------------------------------------
        # Low Population
        # -----------------------------------------

        if population <= 5:

            actions.append(
                "Increase field monitoring."
            )

            actions.append(
                "Launch captive breeding programs."
            )

        elif population <= 20:

            actions.append(
                "Conduct monthly population surveys."
            )

        # -----------------------------------------
        # Endangered Species
        # -----------------------------------------

        if status == "Endangered":

            actions.append(
                "Strengthen anti-poaching patrols."
            )

            actions.append(
                "Expand protected habitat."
            )

        elif status == "Vulnerable":

            actions.append(
                "Increase habitat restoration efforts."
            )

        # -----------------------------------------
        # Limited Distribution
        # -----------------------------------------

        if locations == 1:

            actions.append(
                "Protect migration corridors."
            )

        # -----------------------------------------
        # Default
        # -----------------------------------------

        if not actions:

            actions.append(
                "Continue regular wildlife monitoring."
            )

        strategies.append({

            "species": species,

            "population": population,

            "locations": locations,

            "conservation_status": status,

            "recommended_strategies": actions,

        })

    return {

        "total_species": len(strategies),

        "protection_strategies": strategies,

    }

# ============================================================
# 9.4 MONITORING OPTIMIZATION &
# RESOURCE ALLOCATION RECOMMENDATIONS
# ============================================================

from app.models.habitat import Habitat


async def get_monitoring_optimization():

    habitats = await Habitat.find_all().to_list()

    if not habitats:

        return {
            "total_locations": 0,
            "monitoring_plan": [],
        }

    monitoring_plan = []

    for habitat in habitats:

        score = 0

        resources = []

        frequency = "Monthly"

        # ----------------------------------------------------
        # Vegetation Health
        # ----------------------------------------------------

        if habitat.vegetation_health < 50:

            score += 30

        elif habitat.vegetation_health < 75:

            score += 15

        # ----------------------------------------------------
        # Water Quality
        # ----------------------------------------------------

        if habitat.water_quality < 50:

            score += 30

        elif habitat.water_quality < 75:

            score += 15

        # ----------------------------------------------------
        # Protected Area
        # ----------------------------------------------------

        if not habitat.protected_area:

            score += 20

        # ----------------------------------------------------
        # Area Size
        # ----------------------------------------------------

        if habitat.area_km2 >= 100:

            score += 10

        # ----------------------------------------------------
        # Determine Monitoring Frequency
        # ----------------------------------------------------

        if score >= 60:

            frequency = "Weekly"

            resources = [
                "5 Rangers",
                "10 Camera Traps",
                "2 Drones",
            ]

        elif score >= 30:

            frequency = "Bi-Weekly"

            resources = [
                "3 Rangers",
                "6 Camera Traps",
                "1 Drone",
            ]

        else:

            frequency = "Monthly"

            resources = [
                "2 Rangers",
                "3 Camera Traps",
            ]

        monitoring_plan.append({

            "location": habitat.location,

            "habitat_type": habitat.habitat_type,

            "priority_score": score,

            "monitoring_frequency": frequency,

            "recommended_resources": resources,

        })

    monitoring_plan.sort(

        key=lambda x: x["priority_score"],

        reverse=True

    )

    return {

        "total_locations": len(monitoring_plan),

        "monitoring_plan": monitoring_plan,

    }