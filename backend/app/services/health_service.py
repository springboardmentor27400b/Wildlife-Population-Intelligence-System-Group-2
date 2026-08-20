from collections import defaultdict
from math import log

from app.models.wildlife import Wildlife
from app.models.habitat import Habitat


# ============================================================
# 10.1 BIODIVERSITY SCORE
# ============================================================

async def get_biodiversity_score():

    records = await Wildlife.find_all().to_list()

    if not records:

        return {

            "biodiversity_score": 0,

            "species_richness": 0,

            "shannon_index": 0,

            "evenness": 0,

            "health": "Critical",

        }

    # --------------------------------------------------------
    # Species population
    # --------------------------------------------------------

    species_population = defaultdict(int)

    total_population = 0

    for record in records:

        population = record.count if record.count else 0

        species = record.species_name.strip().title()

        species_population[species] += population

        total_population += population

    richness = len(species_population)

    # --------------------------------------------------------
    # Shannon Index
    # --------------------------------------------------------

    shannon = 0

    for population in species_population.values():

        p = population / total_population

        shannon -= p * log(p)

    # --------------------------------------------------------
    # Evenness
    # --------------------------------------------------------

    if richness > 1:

        evenness = shannon / log(richness)

    else:

        evenness = 0

    # --------------------------------------------------------
    # Biodiversity Score (0–100)
    # --------------------------------------------------------

    biodiversity_score = (

        min(

            evenness,

            1

        )

        * 100

    )

    biodiversity_score = round(

        biodiversity_score,

        2

    )

    # --------------------------------------------------------
    # Classification
    # --------------------------------------------------------

    if biodiversity_score >= 90:

        health = "Excellent"

    elif biodiversity_score >= 75:

        health = "Healthy"

    elif biodiversity_score >= 60:

        health = "Moderate Concern"

    elif biodiversity_score >= 40:

        health = "Vulnerable"

    else:

        health = "Critical"

    return {

        "biodiversity_score": biodiversity_score,

        "species_richness": richness,

        "shannon_index": round(shannon, 4),

        "evenness": round(evenness, 4),

        "health": health,

    }

# ============================================================
# 10.2 HABITAT QUALITY SCORE
# ============================================================

async def get_habitat_quality_score():

    habitats = await Habitat.find_all().to_list()

    if not habitats:

        return {

            "overall_habitat_score": 0,

            "overall_health": "Critical",

            "habitats": []

        }

    habitat_scores = []

    total_score = 0

    for habitat in habitats:

        score = 0

        # ----------------------------------------------------
        # Vegetation Health (40%)
        # ----------------------------------------------------

        score += habitat.vegetation_health * 0.40

        # ----------------------------------------------------
        # Water Quality (30%)
        # ----------------------------------------------------

        score += habitat.water_quality * 0.30

        # ----------------------------------------------------
        # Protected Area (20%)
        # ----------------------------------------------------

        if habitat.protected_area:

            score += 20

        # ----------------------------------------------------
        # Habitat Size (10%)
        # ----------------------------------------------------

        if habitat.area_km2 >= 100:

            score += 10

        elif habitat.area_km2 >= 50:

            score += 5

        score = round(score, 2)

        total_score += score

        # ----------------------------------------------------
        # Classification
        # ----------------------------------------------------

        if score >= 90:

            health = "Excellent"

        elif score >= 75:

            health = "Healthy"

        elif score >= 60:

            health = "Moderate Concern"

        elif score >= 40:

            health = "Vulnerable"

        else:

            health = "Critical"

        habitat_scores.append({

            "location": habitat.location,

            "habitat_type": habitat.habitat_type,

            "score": score,

            "health": health,

        })

    overall = round(

        total_score / len(habitat_scores),

        2

    )

    if overall >= 90:

        overall_health = "Excellent"

    elif overall >= 75:

        overall_health = "Healthy"

    elif overall >= 60:

        overall_health = "Moderate Concern"

    elif overall >= 40:

        overall_health = "Vulnerable"

    else:

        overall_health = "Critical"

    return {

        "overall_habitat_score": overall,

        "overall_health": overall_health,

        "habitats": habitat_scores,

    }

# ============================================================
# 10.3 SPECIES CONSERVATION SCORE
# ============================================================

async def get_species_conservation_score():

    records = await Wildlife.find_all().to_list()

    if not records:

        return {
            "overall_conservation_score": 0,
            "overall_health": "Critical",
            "species": [],
        }

    species_data = {}

    for record in records:

        species = record.species_name.strip().title()

        if species not in species_data:

            species_data[species] = {
                "population": 0,
                "locations": set(),
                "status": record.conservation_status or "Not Evaluated",
            }

        species_data[species]["population"] += record.count or 0
        species_data[species]["locations"].add(record.location)

    species_scores = []

    total_score = 0

    for species, data in species_data.items():

        score = 100

        # ----------------------------------------------------
        # Conservation Status
        # ----------------------------------------------------

        status = data["status"]

        if status == "Critically Endangered":
            score -= 50

        elif status == "Endangered":
            score -= 35

        elif status == "Vulnerable":
            score -= 20

        elif status == "Near Threatened":
            score -= 10

        # ----------------------------------------------------
        # Population
        # ----------------------------------------------------

        if data["population"] < 5:
            score -= 20

        elif data["population"] < 20:
            score -= 10

        # ----------------------------------------------------
        # Distribution
        # ----------------------------------------------------

        location_count = len(data["locations"])

        if location_count == 1:
            score -= 10

        score = max(score, 0)

        total_score += score

        # ----------------------------------------------------
        # Classification
        # ----------------------------------------------------

        if score >= 90:
            health = "Excellent"

        elif score >= 75:
            health = "Healthy"

        elif score >= 60:
            health = "Moderate Concern"

        elif score >= 40:
            health = "Vulnerable"

        else:
            health = "Critical"

        species_scores.append({

            "species": species,

            "population": data["population"],

            "conservation_status": status,

            "locations": location_count,

            "score": score,

            "health": health,

        })

    overall = round(

        total_score / len(species_scores),

        2

    )

    if overall >= 90:
        overall_health = "Excellent"

    elif overall >= 75:
        overall_health = "Healthy"

    elif overall >= 60:
        overall_health = "Moderate Concern"

    elif overall >= 40:
        overall_health = "Vulnerable"

    else:
        overall_health = "Critical"

    return {

        "overall_conservation_score": overall,

        "overall_health": overall_health,

        "species": species_scores,

    }

# ============================================================
# 10.4 POPULATION STABILITY SCORE
# ============================================================

async def get_population_stability_score():

    records = await Wildlife.find_all().to_list()

    if not records:

        return {
            "overall_population_stability_score": 0,
            "overall_health": "Critical",
            "species": [],
        }

    species_data = {}

    for record in records:

        species = record.species_name.strip().title()

        species_data.setdefault(species, []).append(record.count or 0)

    species_scores = []

    total_score = 0

    for species, populations in species_data.items():

        observations = len(populations)

        average = sum(populations) / observations

        maximum = max(populations)

        minimum = min(populations)

        # ----------------------------------------------------
        # Population Variation
        # ----------------------------------------------------

        if average == 0:

            variation = 100

        else:

            variation = ((maximum - minimum) / average) * 100

        # ----------------------------------------------------
        # Stability Score
        # ----------------------------------------------------

        score = max(0, 100 - variation)

        score = round(score, 2)

        total_score += score

        # ----------------------------------------------------
        # Classification
        # ----------------------------------------------------

        if score >= 90:

            health = "Excellent"

        elif score >= 75:

            health = "Healthy"

        elif score >= 60:

            health = "Moderate Concern"

        elif score >= 40:

            health = "Vulnerable"

        else:

            health = "Critical"

        species_scores.append({

            "species": species,

            "observations": observations,

            "average_population": round(average, 2),

            "variation_percent": round(variation, 2),

            "stability_score": score,

            "health": health,

        })

    overall = round(

        total_score / len(species_scores),

        2

    )

    if overall >= 90:

        overall_health = "Excellent"

    elif overall >= 75:

        overall_health = "Healthy"

    elif overall >= 60:

        overall_health = "Moderate Concern"

    elif overall >= 40:

        overall_health = "Vulnerable"

    else:

        overall_health = "Critical"

    return {

        "overall_population_stability_score": overall,

        "overall_health": overall_health,

        "species": species_scores,

    }

# ============================================================
# 10.5 OVERALL ECOSYSTEM HEALTH SCORE
# ============================================================

async def get_ecosystem_health_score():

    biodiversity = await get_biodiversity_score()

    habitat = await get_habitat_quality_score()

    conservation = await get_species_conservation_score()

    population = await get_population_stability_score()

    # --------------------------------------------------------
    # INDIVIDUAL SCORES
    # --------------------------------------------------------

    biodiversity_score = biodiversity["biodiversity_score"]

    habitat_score = habitat["overall_habitat_score"]

    conservation_score = conservation["overall_conservation_score"]

    population_score = population["overall_population_stability_score"]

    # Temporary approximation until environmental sensors exist

    environmental_score = habitat_score

    # --------------------------------------------------------
    # WEIGHTED ECOSYSTEM SCORE
    # --------------------------------------------------------

    ecosystem_score = (

        biodiversity_score * 0.30 +

        population_score * 0.25 +

        habitat_score * 0.20 +

        conservation_score * 0.15 +

        environmental_score * 0.10

    )

    ecosystem_score = round(ecosystem_score, 2)

    # --------------------------------------------------------
    # HEALTH CLASSIFICATION
    # --------------------------------------------------------

    if ecosystem_score >= 90:

        status = "Excellent"

    elif ecosystem_score >= 75:

        status = "Healthy"

    elif ecosystem_score >= 60:

        status = "Moderate Concern"

    elif ecosystem_score >= 40:

        status = "Vulnerable"

    else:

        status = "Critical"

    return {

        "ecosystem_health_score": ecosystem_score,

        "ecosystem_status": status,

        "component_scores": {

            "biodiversity_score": biodiversity_score,

            "population_stability_score": population_score,

            "habitat_quality_score": habitat_score,

            "species_conservation_score": conservation_score,

            "environmental_condition_score": environmental_score,

        },

        "weight_distribution": {

            "biodiversity": "30%",

            "population_stability": "25%",

            "habitat_quality": "20%",

            "species_conservation": "15%",

            "environmental_condition": "10%",

        }

    }