from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Observation, MonitoringSite, Survey
from collections import Counter


def get_dashboard_data(db: Session):

    # =====================================================
    # BASIC OBSERVATION DATA
    # =====================================================

    observations = db.query(Observation).all()

    total_observations = len(observations)

    total_animals = sum(
        (obs.count or 0)
        for obs in observations
    )

    # =====================================================
    # SPECIES DISTRIBUTION
    # =====================================================

    species_counter = Counter()

    for obs in observations:

        if obs.species_name:

            species_name = (
                obs.species_name
                .strip()
                .title()
            )

            species_counter[species_name] += (
                obs.count or 0
            )

    species_distribution = []

    for name, population in species_counter.items():

        percentage = (
            round(
                (population / total_animals) * 100,
                1
            )
            if total_animals
            else 0
        )

        species_distribution.append({
            "species": name,
            "population": population,
            "percentage": percentage
        })

    species_distribution.sort(
        key=lambda x: x["population"],
        reverse=True
    )

    # =====================================================
    # POPULATION METRICS
    # =====================================================

    species_count = len(species_counter)

    dominant_species = None

    if species_counter:
        dominant_species = (
            species_counter
            .most_common(1)[0][0]
        )

    # -----------------------------------------------------
    # Growth rate
    # -----------------------------------------------------

    growth_rate = 0

    dated_observations = [
        obs for obs in observations
        if obs.observation_date
    ]

    if dated_observations:

        dates = sorted(
            obs.observation_date
            for obs in dated_observations
        )

        first_date = dates[0]
        last_date = dates[-1]

        old_population = sum(
            (obs.count or 0)
            for obs in dated_observations
            if obs.observation_date == first_date
        )

        new_population = sum(
            (obs.count or 0)
            for obs in dated_observations
            if obs.observation_date == last_date
        )

        if old_population > 0:
            growth_rate = round(
                (
                    (new_population - old_population)
                    / old_population
                ) * 100,
                2
            )

    # =====================================================
    # MONITORING DATA
    # =====================================================

    monitoring_sites = (
        db.query(MonitoringSite)
        .all()
    )

    total_area = sum(
        (site.area_km2 or 0)
        for site in monitoring_sites
    )

    # Population density
    density = 0

    if total_area > 0:
        density = round(
            total_animals / total_area,
            2
        )

    # =====================================================
    # HABITAT ANALYSIS
    # =====================================================

    habitat_data = {}

    for site in monitoring_sites:

        habitat = (
            site.habitat_type
            or "Unknown"
        )

        if habitat not in habitat_data:

            habitat_data[habitat] = {
                "observations": 0,
                "species": set(),
                "population": 0
            }

    for obs in observations:

        matching_site = None

        for site in monitoring_sites:

            if (
                site.location
                and obs.location
                and site.location.strip().lower()
                == obs.location.strip().lower()
            ):
                matching_site = site
                break

        if matching_site:

            habitat = (
                matching_site.habitat_type
                or "Unknown"
            )

            habitat_data.setdefault(
                habitat,
                {
                    "observations": 0,
                    "species": set(),
                    "population": 0
                }
            )

            habitat_data[habitat][
                "observations"
            ] += 1

            if obs.species_name:

                habitat_data[habitat][
                    "species"
                ].add(
                    obs.species_name.strip().title()
                )

            habitat_data[habitat][
                "population"
            ] += obs.count or 0

    habitat_restoration = []

    for habitat, values in habitat_data.items():

        observations_count = values[
            "observations"
        ]

        species_total = len(
            values["species"]
        )

        population = values[
            "population"
        ]

        # Data-derived scores
        habitat_health_score = min(
            100,
            (
                observations_count * 10
                + species_total * 10
            )
        )

        restoration_score = max(
            0,
            100 - habitat_health_score
        )

        priority = (
            "High"
            if restoration_score >= 70
            else "Medium"
            if restoration_score >= 40
            else "Low"
        )

        habitat_restoration.append({

            "habitat": habitat,

            "observations":
                observations_count,

            "species_count":
                species_total,

            "population":
                population,

            "habitat_health_score":
                habitat_health_score,

            "restoration_score":
                restoration_score,

            "priority":
                priority
        })

    # =====================================================
    # CONSERVATION PRIORITIES
    # =====================================================

    conservation_priorities = []

    for species_name, population in species_counter.items():

        if total_animals > 0:

            population_percentage = (
                population / total_animals
            ) * 100

        else:
            population_percentage = 0

        # Lower population = higher priority
        priority_score = round(
            max(
                0,
                100 - population_percentage
            ),
            2
        )

        priority = (
            "High"
            if priority_score >= 70
            else "Medium"
            if priority_score >= 40
            else "Low"
        )

        recommendation = (
            "Increase monitoring and "
            "conservation attention."
            if priority == "High"
            else
            "Continue regular monitoring."
        )

        conservation_priorities.append({

            "species":
                species_name,

            "population":
                population,

            "priority_score":
                priority_score,

            "priority":
                priority,

            "recommendation":
                recommendation
        })

    conservation_priorities.sort(
        key=lambda x: x["priority_score"],
        reverse=True
    )

    # =====================================================
    # MONITORING OPTIMIZATION
    # =====================================================

    monitoring_optimization = []

    for site in monitoring_sites:

        location = (
            site.location
            or "Unknown"
        )

        site_population = sum(
            (obs.count or 0)
            for obs in observations
            if (
                obs.location
                and site.location
                and obs.location.strip().lower()
                == site.location.strip().lower()
            )
        )

        site_observations = sum(
            1
            for obs in observations
            if (
                obs.location
                and site.location
                and obs.location.strip().lower()
                == site.location.strip().lower()
            )
        )

        monitoring_score = min(
            100,
            site_observations * 10
            + site_population
        )

        monitoring_level = (
            "High"
            if monitoring_score >= 70
            else "Medium"
            if monitoring_score >= 40
            else "Low"
        )

        frequency = (
            "Weekly"
            if monitoring_level == "High"
            else "Bi-weekly"
            if monitoring_level == "Medium"
            else "Monthly"
        )

        monitoring_optimization.append({

            "location":
                location,

            "population":
                site_population,

            "observations":
                site_observations,

            "monitoring_score":
                monitoring_score,

            "monitoring_level":
                monitoring_level,

            "recommended_frequency":
                frequency
        })

    # =====================================================
    # RESOURCE ALLOCATION
    # =====================================================

    resource_allocation = []

    total_site_population = sum(
        item["population"]
        for item in monitoring_optimization
    )

    for item in monitoring_optimization:

        population = item["population"]

        allocation_percentage = (
            round(
                (
                    population
                    / total_site_population
                ) * 100,
                2
            )
            if total_site_population
            else 0
        )

        resource_priority_score = round(
            item["monitoring_score"],
            2
        )

        allocation_level = (
            "High"
            if allocation_percentage >= 50
            else "Medium"
            if allocation_percentage >= 20
            else "Low"
        )

        resource_allocation.append({

            "location":
                item["location"],

            "population":
                population,

            "resource_priority_score":
                resource_priority_score,

            "allocation_level":
                allocation_level,

            "allocation_percentage":
                allocation_percentage,

            "recommendation":
                (
                    "Allocate increased monitoring "
                    "resources."
                    if allocation_level == "High"
                    else
                    "Maintain standard resource allocation."
                )
        })

    # =====================================================
    # BIODIVERSITY
    # =====================================================

    biodiversity_score = 0

    if species_count > 0 and total_animals > 0:

        # Shannon diversity index
        shannon_index = 0

        for population in species_counter.values():

            proportion = (
                population / total_animals
            )

            if proportion > 0:

                import math

                shannon_index -= (
                    proportion
                    * math.log(proportion)
                )

        # Normalize based on observed species
        max_index = math.log(species_count)

        if max_index > 0:

            biodiversity_score = round(
                (
                    shannon_index
                    / max_index
                ) * 100,
                2
            )

    # =====================================================
    # RETURN DATA
    # =====================================================

    return {

        "total_observations":
            total_observations,

        "species_count":
            species_count,

        "animal_count":
            total_animals,

        "biodiversity_score":
            biodiversity_score,

        "species_distribution":
            species_distribution,

        "population_metrics": {

            "population_size":
                total_animals,

            "density":
                density,

            "growth_rate":
                growth_rate,

            "trend":
                (
                    "Increasing"
                    if growth_rate > 0
                    else "Decreasing"
                    if growth_rate < 0
                    else "Stable"
                ),

            "species_richness":
                species_count,

            "dominant_species":
                dominant_species
        },

        "biodiversity": {

            "biodiversity_score":
                biodiversity_score,

            "species_count":
                species_count,

            "animal_count":
                total_animals
        },

        "habitat_restoration":
            habitat_restoration,

        "conservation_priorities":
            conservation_priorities,

        "monitoring_optimization":
            monitoring_optimization,

        "resource_allocation":
            resource_allocation
    }