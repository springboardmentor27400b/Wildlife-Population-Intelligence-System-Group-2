from collections import defaultdict
from datetime import datetime, timezone
import math

from app.models.wildlife import Wildlife


async def get_population_overview():
    """
    Generate population intelligence from existing wildlife records.

    This service aggregates wildlife observations stored in MongoDB.
    Each Wildlife record represents an observation/detection and has
    a count representing the number of animals in that observation.
    """

    # ---------------------------------------------------------
    # GET ALL WILDLIFE RECORDS
    # ---------------------------------------------------------

    wildlife_records = await Wildlife.find_all().to_list()

    # ---------------------------------------------------------
    # EMPTY DATABASE HANDLING
    # ---------------------------------------------------------

    if not wildlife_records:
        return {
            "total_population": 0,
            "total_observations": 0,
            "species_richness": 0,
            "species_population": {},
            "species_percentages": {},
            "population_by_location": {},
            "most_abundant_species": None,
        }

    # ---------------------------------------------------------
    # INITIALIZE ANALYTICS
    # ---------------------------------------------------------

    total_population = 0

    species_population = defaultdict(int)

    population_by_location = defaultdict(int)

    # ---------------------------------------------------------
    # PROCESS EACH WILDLIFE RECORD
    # ---------------------------------------------------------

    for record in wildlife_records:

        # Make sure count is valid
        count = record.count if record.count and record.count > 0 else 0

        species = (
            record.species_name.strip().title()
            if record.species_name
            else "Unknown"
        )

        location = (
            record.location.strip()
            if record.location
            else "Unknown"
        )

        # -----------------------------------------------------
        # TOTAL POPULATION
        # -----------------------------------------------------

        total_population += count

        # -----------------------------------------------------
        # SPECIES POPULATION
        # -----------------------------------------------------

        species_population[species] += count

        # -----------------------------------------------------
        # LOCATION POPULATION
        # -----------------------------------------------------

        population_by_location[location] += count

    # ---------------------------------------------------------
    # SPECIES RICHNESS
    # ---------------------------------------------------------

    # Number of unique species observed

    species_richness = len(
        species_population
    )

    # ---------------------------------------------------------
    # SPECIES PERCENTAGES
    # ---------------------------------------------------------

    species_percentages = {}

    if total_population > 0:

        for species, population in species_population.items():

            percentage = (
                population
                /
                total_population
            ) * 100

            species_percentages[species] = round(
                percentage,
                2
            )

    # ---------------------------------------------------------
    # MOST ABUNDANT SPECIES
    # ---------------------------------------------------------

    most_abundant_species = None

    if species_population:
        most_abundant_species= max(
            species_population.items(),
            key=lambda item: item[1],
        )[0]

    # ---------------------------------------------------------
    # RETURN POPULATION INTELLIGENCE
    # ---------------------------------------------------------

    return {

        "total_population": total_population,

        "total_observations": len(
            wildlife_records
        ),

        "species_richness": species_richness,

        "species_population": dict(
            species_population
        ),

        "species_percentages": species_percentages,

        "population_by_location": dict(
            population_by_location
        ),

        "most_abundant_species": (
            most_abundant_species
        ),

    }

async def get_population_trends(
    species: str | None = None,
    location: str | None = None,
):
    """
    Analyze wildlife population trends over time.

    Supports optional filtering by:
    - Species
    - Location
    """

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    wildlife_records = await Wildlife.find_all().to_list()

    # ========================================================
    # FILTER BY SPECIES
    # ========================================================

    if species:

        requested_species = (
            species.strip().lower()
        )

        wildlife_records = [

            record

            for record in wildlife_records

            if record.species_name

            and record.species_name.strip().lower()
            == requested_species

        ]

    # ========================================================
    # FILTER BY LOCATION
    # ========================================================

    if location:

        requested_location = (
            location.strip().lower()
        )

        wildlife_records = [

            record

            for record in wildlife_records

            if record.location

            and record.location.strip().lower()
            == requested_location

        ]

    # ========================================================
    # NO DATA
    # ========================================================

    if not wildlife_records:

        return {

            "species": species,

            "location": location,

            "total_population": 0,

            "growth_rate": 0,

            "trend": "No Data",

            "timeline": [],

        }

    # ========================================================
    # GROUP POPULATION BY DATE
    # ========================================================

    daily_population = {}

    for record in wildlife_records:

        observed_at = record.observed_at

        # ----------------------------------------------------
        # SAFETY FOR OLD RECORDS
        # ----------------------------------------------------

        if observed_at is None:

            continue

        # ----------------------------------------------------
        # CONVERT TO UTC
        # ----------------------------------------------------

        if observed_at.tzinfo is None:

            observed_at = observed_at.replace(
                tzinfo=timezone.utc
            )

        observed_date = (

            observed_at

            .astimezone(timezone.utc)

            .date()

            .isoformat()

        )

        # ----------------------------------------------------
        # GET COUNT
        # ----------------------------------------------------

        count = (

            record.count

            if record.count
            and record.count > 0

            else 0

        )

        # ----------------------------------------------------
        # ADD TO DAILY POPULATION
        # ----------------------------------------------------

        if observed_date not in daily_population:

            daily_population[
                observed_date
            ] = 0

        daily_population[
            observed_date
        ] += count

    # ========================================================
    # SORT DATES
    # ========================================================

    sorted_dates = sorted(
        daily_population.keys()
    )

    # ========================================================
    # CREATE TIMELINE
    # ========================================================

    timeline = [

        {

            "date": date,

            "population": daily_population[
                date
            ],

        }

        for date in sorted_dates

    ]

    # ========================================================
    # CALCULATE TREND
    # ========================================================

    if len(timeline) < 2:

        growth_rate = 0

        trend = "Insufficient Data"

    else:

        first_population = (

            timeline[0][
                "population"
            ]

        )

        latest_population = (

            timeline[-1][
                "population"
            ]

        )

        if first_population > 0:

            growth_rate = (

                (

                    latest_population

                    -

                    first_population

                )

                /

                first_population

            ) * 100

        else:

            growth_rate = 0

        # ----------------------------------------------------
        # DETERMINE TREND
        # ----------------------------------------------------

        if latest_population > first_population:

            trend = "Increasing"

        elif latest_population < first_population:

            trend = "Declining"

        else:

            trend = "Stable"

    # ========================================================
    # TOTAL POPULATION
    # ========================================================

    total_population = sum(

        item[
            "population"
        ]

        for item in timeline

    )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "species": species,

        "location": location,

        "total_population": total_population,

        "growth_rate": round(
            growth_rate,
            2
        ),

        "trend": trend,

        "timeline": timeline,

    }
# ============================================================
# SPECIES POPULATION RANKING
# ============================================================

async def get_species_population_ranking():

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # CALCULATE POPULATION BY SPECIES
    # ========================================================

    species_population = {}

    for record in records:

        species = (
            record.species_name
            .strip()
            .title()
        )

        population = (
            record.count
            if record.count
            and record.count > 0
            else 0
        )

        species_population[species] = (

            species_population.get(
                species,
                0
            )

            +

            population

        )

    # ========================================================
    # SORT SPECIES BY POPULATION
    # ========================================================

    sorted_species = sorted(

        species_population.items(),

        key=lambda item: item[1],

        reverse=True

    )

    # ========================================================
    # CREATE RANKING
    # ========================================================

    ranking = []

    for index, (
        species,
        population
    ) in enumerate(
        sorted_species,
        start=1
    ):

        ranking.append({

            "rank": index,

            "species": species,

            "population": population,

        })

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "total_species": len(
            ranking
        ),

        "ranking": ranking,

    }

# ============================================================
# POPULATION ALERTS & ANOMALY DETECTION
# ============================================================

async def get_population_alerts():

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # GROUP RECORDS BY SPECIES + LOCATION
    # ========================================================

    grouped_data = {}

    for record in records:

        # ----------------------------------------------------
        # SPECIES
        # ----------------------------------------------------

        species = (
            record.species_name
            .strip()
            .title()
        )

        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        location = (
            record.location
            .strip()
        )

        # ----------------------------------------------------
        # USE EXISTING RECORD ID AS FALLBACK ORDER
        # ----------------------------------------------------

        key = (
            species.lower(),
            location.lower()
        )

        if key not in grouped_data:

            grouped_data[key] = {

                "species": species,

                "location": location,

                "observations": []

            }

        grouped_data[key][
            "observations"
        ].append({

            "population": record.count,

            "record_id": str(
                record.id
            ),

        })

    # ========================================================
    # ANALYZE POPULATION CHANGES
    # ========================================================

    alerts = []

    for data in grouped_data.values():

        observations = (
            data["observations"]
        )

        # ----------------------------------------------------
        # NEED AT LEAST TWO OBSERVATIONS
        # ----------------------------------------------------

        if len(observations) < 2:

            continue

        # ----------------------------------------------------
        # USE LAST TWO RECORDS
        # ----------------------------------------------------

        previous = observations[-2]

        current = observations[-1]

        previous_population = (

            previous["population"]

        )

        current_population = (

            current["population"]

        )

        # ----------------------------------------------------
        # VALIDATE POPULATION
        # ----------------------------------------------------

        if previous_population is None:

            continue

        if current_population is None:

            continue

        if previous_population <= 0:

            continue

        # ----------------------------------------------------
        # CALCULATE CHANGE
        # ----------------------------------------------------

        change_percentage = (

            (

                current_population

                -

                previous_population

            )

            /

            previous_population

        ) * 100

        # ----------------------------------------------------
        # DETERMINE ALERT SEVERITY
        # ----------------------------------------------------

        if change_percentage <= -30:

            alert_type = (
                "Population Decline"
            )

            severity = "High"

        elif change_percentage <= -15:

            alert_type = (
                "Population Decline"
            )

            severity = "Medium"

        elif change_percentage <= -5:

            alert_type = (
                "Population Decline"
            )

            severity = "Low"

        elif change_percentage >= 30:

            alert_type = (
                "Population Increase"
            )

            severity = "Informational"

        else:

            alert_type = (
                "Stable Population"
            )

            severity = "None"

        # ----------------------------------------------------
        # IGNORE STABLE POPULATIONS
        # ----------------------------------------------------

        if severity == "None":

            continue

        # ----------------------------------------------------
        # ADD ALERT
        # ----------------------------------------------------

        alerts.append({

            "species": (
                data["species"]
            ),

            "location": (
                data["location"]
            ),

            "previous_population": (

                previous_population

            ),

            "current_population": (

                current_population

            ),

            "change_percentage": round(

                change_percentage,

                2

            ),

            "alert_type": (

                alert_type

            ),

            "severity": (

                severity

            ),

        })

    # ========================================================
    # SORT ALERTS BY SEVERITY
    # ========================================================

    severity_order = {

        "High": 1,

        "Medium": 2,

        "Low": 3,

        "Informational": 4,

    }

    alerts.sort(

        key=lambda item:

        severity_order.get(

            item["severity"],

            99

        )

    )

    # ========================================================
    # RETURN RESPONSE
    # ========================================================

    return {

        "total_alerts": len(
            alerts
        ),

        "alerts": alerts,

    }

# ============================================================
# MIGRATION ANALYSIS
# ============================================================

async def get_migration_analysis(
    species: str | None = None,
    location: str | None = None,
):
    """
    Analyze possible wildlife movement between locations.

    Migration is inferred when the same species has been
    observed at multiple locations over time.

    Optional filters:
    - species
    - location
    """

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # FILTER BY SPECIES
    # ========================================================

    if species:

        requested_species = (
            species
            .strip()
            .lower()
        )

        records = [

            record

            for record in records

            if record.species_name

            and record.species_name.strip().lower()
            == requested_species

        ]

    # ========================================================
    # FILTER BY LOCATION
    # ========================================================

    if location:

        requested_location = (
            location
            .strip()
            .lower()
        )

        records = [

            record

            for record in records

            if record.location

            and record.location.strip().lower()
            == requested_location

        ]

    # ========================================================
    # NO DATA
    # ========================================================

    if not records:

        return {

            "total_species_analyzed": 0,

            "migration_detected": False,

            "species_movement": [],

        }

    # ========================================================
    # GROUP OBSERVATIONS BY SPECIES
    # ========================================================

    species_records = defaultdict(list)

    for record in records:

        if not record.species_name:

            continue

        if not record.location:

            continue

        species_name = (
            record.species_name
            .strip()
            .title()
        )

        location_name = (
            record.location
            .strip()
        )

        species_records[
            species_name
        ].append({

            "location": location_name,

            "observed_at": (
                record.observed_at
            ),

            "count": (
                record.count
                if record.count
                and record.count > 0
                else 0
            ),

            "latitude": (
                record.latitude
            ),

            "longitude": (
                record.longitude
            ),

        })

    # ========================================================
    # ANALYZE SPECIES MOVEMENT
    # ========================================================

    species_movement = []

    for species_name, observations in species_records.items():

        # ----------------------------------------------------
        # SORT BY OBSERVATION TIME
        # ----------------------------------------------------

        observations.sort(

            key=lambda item:

            item["observed_at"]

            if item["observed_at"]

            else datetime.min.replace(
                tzinfo=timezone.utc
            )

        )

        # ----------------------------------------------------
        # GET UNIQUE LOCATIONS
        # ----------------------------------------------------

        unique_locations = []

        for observation in observations:

            location_name = (
                observation["location"]
            )

            if location_name not in unique_locations:

                unique_locations.append(
                    location_name
                )

        # ----------------------------------------------------
        # DETERMINE MIGRATION
        # ----------------------------------------------------

        migration_detected = (

            len(unique_locations) > 1

        )

        # ----------------------------------------------------
        # BUILD MOVEMENT HISTORY
        # ----------------------------------------------------

        movement = []

        for index in range(
            1,
            len(observations)
        ):

            previous = (
                observations[
                    index - 1
                ]
            )

            current = (
                observations[
                    index
                ]
            )

            previous_location = (
                previous["location"]
            )

            current_location = (
                current["location"]
            )

            # Only record actual location changes

            if (

                previous_location.lower()

                !=

                current_location.lower()

            ):

                movement.append({

                    "from": (
                        previous_location
                    ),

                    "to": (
                        current_location
                    ),

                    "from_date": (

                        previous[
                            "observed_at"
                        ]

                    ),

                    "to_date": (

                        current[
                            "observed_at"
                        ]

                    ),

                })

        # ----------------------------------------------------
        # TOTAL POPULATION OBSERVED
        # ----------------------------------------------------

        total_population = sum(

            observation[
                "count"
            ]

            for observation in observations

        )

        # ----------------------------------------------------
        # ADD SPECIES RESULT
        # ----------------------------------------------------

        species_movement.append({

            "species": (
                species_name
            ),

            "total_observations": (

                len(observations)

            ),

            "total_population_observed": (

                total_population

            ),

            "locations_visited": (

                len(unique_locations)

            ),

            "locations": (

                unique_locations

            ),

            "migration_detected": (

                migration_detected

            ),

            "movement": (

                movement

            ),

        })

    # ========================================================
    # OVERALL MIGRATION STATUS
    # ========================================================

    migration_detected = any(

        item[
            "migration_detected"
        ]

        for item in species_movement

    )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "total_species_analyzed": (

            len(species_movement)

        ),

        "migration_detected": (

            migration_detected

        ),

        "species_movement": (

            species_movement

        ),

    }

# ============================================================
# SPECIES DISTRIBUTION MAPPING
# ============================================================

async def get_species_distribution(
    species: str | None = None,
    location: str | None = None,
):
    """
    Analyze the geographic distribution of wildlife species.

    Uses:
    - Species name
    - Location
    - Population count
    - Latitude
    - Longitude

    Optional filters:
    - species
    - location
    """

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # FILTER BY SPECIES
    # ========================================================

    if species:

        requested_species = (
            species
            .strip()
            .lower()
        )

        records = [

            record

            for record in records

            if record.species_name

            and record.species_name.strip().lower()
            == requested_species

        ]

    # ========================================================
    # FILTER BY LOCATION
    # ========================================================

    if location:

        requested_location = (
            location
            .strip()
            .lower()
        )

        records = [

            record

            for record in records

            if record.location

            and record.location.strip().lower()
            == requested_location

        ]

    # ========================================================
    # NO DATA
    # ========================================================

    if not records:

        return {

            "total_species": 0,

            "total_locations": 0,

            "distribution": [],

        }

    # ========================================================
    # GROUP BY SPECIES
    # ========================================================

    species_data = defaultdict(
        lambda: {
            "locations": {},
            "total_population": 0,
        }
    )

    # ========================================================
    # PROCESS RECORDS
    # ========================================================

    for record in records:

        # ----------------------------------------------------
        # VALIDATE SPECIES
        # ----------------------------------------------------

        if not record.species_name:

            continue

        species_name = (
            record.species_name
            .strip()
            .title()
        )

        # ----------------------------------------------------
        # VALIDATE LOCATION
        # ----------------------------------------------------

        location_name = (

            record.location.strip()

            if record.location

            else "Unknown"

        )

        # ----------------------------------------------------
        # VALIDATE POPULATION
        # ----------------------------------------------------

        population = (

            record.count

            if record.count

            and record.count > 0

            else 0

        )

        # ----------------------------------------------------
        # ADD TO TOTAL SPECIES POPULATION
        # ----------------------------------------------------

        species_data[
            species_name
        ][
            "total_population"
        ] += population

        # ----------------------------------------------------
        # CREATE LOCATION ENTRY
        # ----------------------------------------------------

        if (

            location_name

            not in

            species_data[
                species_name
            ][
                "locations"
            ]

        ):

            species_data[
                species_name
            ][
                "locations"
            ][
                location_name
            ] = {

                "location": (
                    location_name
                ),

                "population": 0,

                "latitude": (
                    record.latitude
                ),

                "longitude": (
                    record.longitude
                ),

                "observations": 0,

            }

        # ----------------------------------------------------
        # UPDATE LOCATION POPULATION
        # ----------------------------------------------------

        species_data[
            species_name
        ][
            "locations"
        ][
            location_name
        ][
            "population"
        ] += population

        # ----------------------------------------------------
        # UPDATE OBSERVATION COUNT
        # ----------------------------------------------------

        species_data[
            species_name
        ][
            "locations"
        ][
            location_name
        ][
            "observations"
        ] += 1

        # ----------------------------------------------------
        # UPDATE GPS IF PREVIOUSLY MISSING
        # ----------------------------------------------------

        location_data = (

            species_data[
                species_name
            ][
                "locations"
            ][
                location_name
            ]

        )

        if (

            location_data[
                "latitude"
            ]

            is None

            and record.latitude

            is not None

        ):

            location_data[
                "latitude"
            ] = record.latitude

        if (

            location_data[
                "longitude"
            ]

            is None

            and record.longitude

            is not None

        ):

            location_data[
                "longitude"
            ] = record.longitude

    # ========================================================
    # BUILD DISTRIBUTION RESPONSE
    # ========================================================

    distribution = []

    all_locations = set()

    for species_name, data in species_data.items():

        locations = list(

            data[
                "locations"
            ].values()

        )

        for location_data in locations:

            all_locations.add(

                location_data[
                    "location"
                ]

            )

        distribution.append({

            "species": (
                species_name
            ),

            "total_population": (

                data[
                    "total_population"
                ]

            ),

            "locations": locations,

        })

    # ========================================================
    # SORT SPECIES
    # ========================================================

    distribution.sort(

        key=lambda item:

        item[
            "total_population"
        ],

        reverse=True

    )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "total_species": (

            len(distribution)

        ),

        "total_locations": (

            len(all_locations)

        ),

        "distribution": (

            distribution

        ),

    }

# ============================================================
# BIODIVERSITY INDEX CALCULATION
# ============================================================

import math


async def get_biodiversity_index():

    """
    Calculate biodiversity intelligence using
    species population data.

    Metrics:
    - Total population
    - Species richness
    - Shannon diversity index
    - Species evenness
    - Biodiversity level
    """

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # EMPTY DATABASE
    # ========================================================

    if not records:

        return {

            "total_population": 0,

            "species_richness": 0,

            "shannon_diversity_index": 0,

            "species_evenness": 0,

            "biodiversity_level": "No Data",

        }

    # ========================================================
    # CALCULATE POPULATION BY SPECIES
    # ========================================================

    species_population = defaultdict(int)

    total_population = 0

    for record in records:

        # ----------------------------------------------------
        # VALIDATE SPECIES
        # ----------------------------------------------------

        if not record.species_name:

            continue

        species = (

            record.species_name

            .strip()

            .title()

        )

        # ----------------------------------------------------
        # VALIDATE COUNT
        # ----------------------------------------------------

        count = (

            record.count

            if record.count

            and record.count > 0

            else 0

        )

        # ----------------------------------------------------
        # ADD POPULATION
        # ----------------------------------------------------

        species_population[
            species
        ] += count

        total_population += count

    # ========================================================
    # SPECIES RICHNESS
    # ========================================================

    species_richness = len(

        species_population

    )

    # ========================================================
    # HANDLE ZERO POPULATION
    # ========================================================

    if (

        total_population == 0

        or species_richness == 0

    ):

        return {

            "total_population": 0,

            "species_richness": 0,

            "shannon_diversity_index": 0,

            "species_evenness": 0,

            "biodiversity_level": "No Data",

        }

    # ========================================================
    # SHANNON DIVERSITY INDEX
    # ========================================================

    shannon_index = 0.0

    for population in species_population.values():

        # ----------------------------------------------------
        # SPECIES PROPORTION
        # ----------------------------------------------------

        proportion = (

            population

            /

            total_population

        )

        # ----------------------------------------------------
        # SHANNON FORMULA
        # ----------------------------------------------------

        shannon_index -= (

            proportion

            *

            math.log(

                proportion

            )

        )

    # ========================================================
    # SPECIES EVENNESS
    # ========================================================

    if species_richness > 1:

        max_shannon_index = math.log(

            species_richness

        )

        species_evenness = (

            shannon_index

            /

            max_shannon_index

        )

    else:

        species_evenness = 1.0

    # ========================================================
    # ROUND VALUES
    # ========================================================

    shannon_index = round(

        shannon_index,

        4

    )

    species_evenness = round(

        species_evenness,

        4

    )

    # ========================================================
    # DETERMINE BIODIVERSITY LEVEL
    # ========================================================

    if shannon_index >= 1.5:

        biodiversity_level = "Very High"

    elif shannon_index >= 1.0:

        biodiversity_level = "High"

    elif shannon_index >= 0.5:

        biodiversity_level = "Moderate"

    else:

        biodiversity_level = "Low"

    # ========================================================
    # RETURN BIODIVERSITY INTELLIGENCE
    # ========================================================

    return {

        "total_population": (

            total_population

        ),

        "species_richness": (

            species_richness

        ),

        "shannon_diversity_index": (

            shannon_index

        ),

        "species_evenness": (

            species_evenness

        ),

        "biodiversity_level": (

            biodiversity_level

        ),

        "species_population": dict(

            species_population

        ),

    }

# ============================================================
# SPECIES DIVERSITY ANALYSIS
# ============================================================

async def get_species_diversity_analysis():

    """
    Analyze the distribution and abundance of each species.

    Metrics:
    - Population
    - Population percentage
    - Relative abundance
    - Dominance classification
    - Most abundant species
    - Least abundant species
    """

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # EMPTY DATABASE
    # ========================================================

    if not records:

        return {

            "total_population": 0,

            "species_richness": 0,

            "species_analysis": [],

            "most_abundant_species": None,

            "least_abundant_species": None,

        }

    # ========================================================
    # CALCULATE POPULATION BY SPECIES
    # ========================================================

    species_population = defaultdict(int)

    total_population = 0

    for record in records:

        # ----------------------------------------------------
        # VALIDATE SPECIES
        # ----------------------------------------------------

        if not record.species_name:

            continue

        species = (

            record.species_name

            .strip()

            .title()

        )

        # ----------------------------------------------------
        # VALIDATE COUNT
        # ----------------------------------------------------

        population = (

            record.count

            if record.count

            and record.count > 0

            else 0

        )

        # ----------------------------------------------------
        # ADD SPECIES POPULATION
        # ----------------------------------------------------

        species_population[
            species
        ] += population

        total_population += population

    # ========================================================
    # HANDLE NO VALID POPULATION
    # ========================================================

    if (

        total_population == 0

        or not species_population

    ):

        return {

            "total_population": 0,

            "species_richness": 0,

            "species_analysis": [],

            "most_abundant_species": None,

            "least_abundant_species": None,

        }

    # ========================================================
    # SPECIES RICHNESS
    # ========================================================

    species_richness = len(

        species_population

    )

    # ========================================================
    # FIND MOST AND LEAST ABUNDANT SPECIES
    # ========================================================

    most_abundant_species = max(

        species_population.items(),

        key=lambda item: item[1]

    )[0]

    least_abundant_species = min(

        species_population.items(),

        key=lambda item: item[1]

    )[0]

    # ========================================================
    # CREATE SPECIES ANALYSIS
    # ========================================================

    species_analysis = []

    for species, population in (

        species_population.items()

    ):

        # ----------------------------------------------------
        # CALCULATE POPULATION PERCENTAGE
        # ----------------------------------------------------

        population_percentage = (

            population

            /

            total_population

        ) * 100

        # ----------------------------------------------------
        # RELATIVE ABUNDANCE
        # ----------------------------------------------------

        relative_abundance = (

            population

            /

            total_population

        )

        # ----------------------------------------------------
        # DETERMINE DOMINANCE
        # ----------------------------------------------------

        if population_percentage >= 40:

            dominance = "Dominant"

        elif population_percentage >= 20:

            dominance = "Common"

        elif population_percentage >= 5:

            dominance = "Moderate"

        else:

            dominance = "Rare"

        # ----------------------------------------------------
        # ADD SPECIES RESULT
        # ----------------------------------------------------

        species_analysis.append({

            "species": species,

            "population": population,

            "population_percentage": round(

                population_percentage,

                2

            ),

            "relative_abundance": round(

                relative_abundance,

                4

            ),

            "dominance": dominance,

        })

    # ========================================================
    # SORT BY POPULATION
    # ========================================================

    species_analysis.sort(

        key=lambda item:

        item["population"],

        reverse=True

    )

    # ========================================================
    # RETURN SPECIES DIVERSITY ANALYSIS
    # ========================================================

    return {

        "total_population": (

            total_population

        ),

        "species_richness": (

            species_richness

        ),

        "species_analysis": (

            species_analysis

        ),

        "most_abundant_species": (

            most_abundant_species

        ),

        "least_abundant_species": (

            least_abundant_species

        ),

    }

# ============================================================
# HABITAT HEALTH ASSESSMENT
# ============================================================

async def get_habitat_health_assessment():

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # EMPTY DATABASE
    # ========================================================

    if not records:

        return {
            "total_locations_analyzed": 0,
            "overall_habitat_health": "No Data",
            "habitat_health": [],
        }

    # ========================================================
    # GROUP DATA BY LOCATION
    # ========================================================

    location_data = {}

    for record in records:

        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        location = (
            record.location.strip()
            if record.location
            else "Unknown"
        )

        # ----------------------------------------------------
        # SPECIES
        # ----------------------------------------------------

        species = (
            record.species_name.strip().title()
            if record.species_name
            else "Unknown"
        )

        # ----------------------------------------------------
        # POPULATION
        # ----------------------------------------------------

        population = (
            record.count
            if record.count
            and record.count > 0
            else 0
        )

        # ----------------------------------------------------
        # INITIALIZE LOCATION
        # ----------------------------------------------------

        if location not in location_data:

            location_data[location] = {

                "total_population": 0,

                "species": set(),

                "observations": 0,

            }

        # ----------------------------------------------------
        # ADD DATA
        # ----------------------------------------------------

        location_data[location][
            "total_population"
        ] += population

        location_data[location][
            "species"
        ].add(species)

        location_data[location][
            "observations"
        ] += 1

    # ========================================================
    # ANALYZE HABITAT HEALTH
    # ========================================================

    habitat_health = []

    for location, data in location_data.items():

        total_population = (
            data["total_population"]
        )

        species_richness = len(
            data["species"]
        )

        observations = (
            data["observations"]
        )

        # ====================================================
        # CALCULATE POPULATION DENSITY
        # ====================================================

        # Since the Wildlife model does not currently store
        # area for each location, density is represented as
        # population per observation.

        if observations > 0:

            population_density = (

                total_population
                /
                observations

            )

        else:

            population_density = 0

        # ====================================================
        # CALCULATE HABITAT HEALTH SCORE
        # ====================================================

        # Species diversity component
        #
        # Maximum reference richness = 10 species

        species_score = min(

            species_richness
            /
            10
            *
            100,

            100

        )

        # Population component
        #
        # A moderate population level receives a higher score.
        # This is a simplified assessment based on available
        # wildlife observation data.

        if total_population >= 50:

            population_score = 100

        elif total_population >= 20:

            population_score = 75

        elif total_population >= 10:

            population_score = 50

        elif total_population > 0:

            population_score = 25

        else:

            population_score = 0

        # Observation coverage component

        if observations >= 5:

            observation_score = 100

        elif observations >= 3:

            observation_score = 75

        elif observations >= 2:

            observation_score = 50

        else:

            observation_score = 25

        # ====================================================
        # FINAL HABITAT HEALTH SCORE
        # ====================================================

        habitat_health_score = (

            species_score * 0.40

            +

            population_score * 0.35

            +

            observation_score * 0.25

        )

        habitat_health_score = round(

            habitat_health_score,

            2

        )

        # ====================================================
        # DETERMINE HEALTH CATEGORY
        # ====================================================

        if habitat_health_score >= 80:

            health_status = "Excellent"

        elif habitat_health_score >= 60:

            health_status = "Healthy"

        elif habitat_health_score >= 40:

            health_status = "Moderate Concern"

        elif habitat_health_score >= 20:

            health_status = "Vulnerable"

        else:

            health_status = "Critical"

        # ====================================================
        # ADD RESULT
        # ====================================================

        habitat_health.append({

            "location": location,

            "total_population": total_population,

            "species_richness": species_richness,

            "observations": observations,

            "population_density": round(

                population_density,

                2

            ),

            "habitat_health_score": (

                habitat_health_score

            ),

            "habitat_health": (

                health_status

            ),

        })

    # ========================================================
    # CALCULATE OVERALL HABITAT HEALTH
    # ========================================================

    if habitat_health:

        average_score = (

            sum(

                item[
                    "habitat_health_score"
                ]

                for item in habitat_health

            )

            /

            len(habitat_health)

        )

    else:

        average_score = 0

    # ========================================================
    # OVERALL HEALTH CATEGORY
    # ========================================================

    if average_score >= 80:

        overall_health = "Excellent"

    elif average_score >= 60:

        overall_health = "Healthy"

    elif average_score >= 40:

        overall_health = "Moderate Concern"

    elif average_score >= 20:

        overall_health = "Vulnerable"

    else:

        overall_health = "Critical"

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "total_locations_analyzed": len(
            habitat_health
        ),

        "overall_habitat_health_score": round(

            average_score,

            2

        ),

        "overall_habitat_health": (

            overall_health

        ),

        "habitat_health": habitat_health,

    }

# ============================================================
# 7.4 ECOSYSTEM MONITORING
# ============================================================

async def get_ecosystem_monitoring():

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # EMPTY DATABASE
    # ========================================================

    if not records:

        return {
            "overall_ecosystem_status": "No Data",
            "total_locations_monitored": 0,
            "total_species_observed": 0,
            "total_population": 0,
            "ecosystem_monitoring": [],
        }

    # ========================================================
    # GROUP DATA BY LOCATION
    # ========================================================

    location_data = {}

    total_population = 0
    all_species = set()

    for record in records:

        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        location = (
            record.location.strip()
            if record.location
            else "Unknown"
        )

        # ----------------------------------------------------
        # SPECIES
        # ----------------------------------------------------

        species = (
            record.species_name.strip().title()
            if record.species_name
            else "Unknown"
        )

        # ----------------------------------------------------
        # POPULATION
        # ----------------------------------------------------

        population = (
            record.count
            if record.count
            and record.count > 0
            else 0
        )

        # ----------------------------------------------------
        # INITIALIZE LOCATION
        # ----------------------------------------------------

        if location not in location_data:

            location_data[location] = {

                "total_population": 0,

                "species": set(),

                "observations": 0,

            }

        # ----------------------------------------------------
        # UPDATE LOCATION DATA
        # ----------------------------------------------------

        location_data[location][
            "total_population"
        ] += population

        location_data[location][
            "species"
        ].add(species)

        location_data[location][
            "observations"
        ] += 1

        # ----------------------------------------------------
        # GLOBAL DATA
        # ----------------------------------------------------

        total_population += population

        all_species.add(species)

    # ========================================================
    # GENERATE ECOSYSTEM MONITORING REPORT
    # ========================================================

    ecosystem_monitoring = []

    for location, data in location_data.items():

        species_richness = len(
            data["species"]
        )

        population = data[
            "total_population"
        ]

        observations = data[
            "observations"
        ]

        # ----------------------------------------------------
        # SIMPLE ECOSYSTEM HEALTH SCORE
        # ----------------------------------------------------

        # Species richness score
        richness_score = min(
            species_richness * 10,
            40
        )

        # Population score
        population_score = min(
            population,
            30
        )

        # Monitoring activity score
        monitoring_score = min(
            observations * 5,
            30
        )

        ecosystem_score = (

            richness_score

            +

            population_score

            +

            monitoring_score

        )

        ecosystem_score = round(
            min(ecosystem_score, 100),
            2
        )

        # ----------------------------------------------------
        # DETERMINE ECOSYSTEM STATUS
        # ----------------------------------------------------

        if ecosystem_score >= 80:

            ecosystem_status = "Healthy"

        elif ecosystem_score >= 60:

            ecosystem_status = "Good"

        elif ecosystem_score >= 40:

            ecosystem_status = "Moderate Concern"

        elif ecosystem_score >= 20:

            ecosystem_status = "Vulnerable"

        else:

            ecosystem_status = "Critical"

        # ----------------------------------------------------
        # ADD LOCATION REPORT
        # ----------------------------------------------------

        ecosystem_monitoring.append({

            "location": location,

            "total_population": population,

            "species_richness": species_richness,

            "observations": observations,

            "ecosystem_health_score": ecosystem_score,

            "ecosystem_status": ecosystem_status,

        })

    # ========================================================
    # OVERALL ECOSYSTEM STATUS
    # ========================================================

    average_score = (

        sum(

            item[
                "ecosystem_health_score"
            ]

            for item in ecosystem_monitoring

        )

        /

        len(
            ecosystem_monitoring
        )

    )

    average_score = round(
        average_score,
        2
    )

    if average_score >= 80:

        overall_status = "Healthy"

    elif average_score >= 60:

        overall_status = "Good"

    elif average_score >= 40:

        overall_status = "Moderate Concern"

    elif average_score >= 20:

        overall_status = "Vulnerable"

    else:

        overall_status = "Critical"

    # ========================================================
    # RETURN ECOSYSTEM MONITORING
    # ========================================================

    return {

        "overall_ecosystem_status":
            overall_status,

        "overall_ecosystem_health_score":
            average_score,

        "total_locations_monitored":
            len(location_data),

        "total_species_observed":
            len(all_species),

        "total_population":
            total_population,

        "ecosystem_monitoring":
            ecosystem_monitoring,

    }

# ============================================================
# CONSERVATION PRIORITY ANALYSIS — MODULE 7.5
# ============================================================

async def get_conservation_priority_analysis():

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    records = await Wildlife.find_all().to_list()

    # ========================================================
    # EMPTY DATABASE
    # ========================================================

    if not records:
        return {
            "total_species_analyzed": 0,
            "priority_species": [],
        }

    # ========================================================
    # GROUP DATA BY SPECIES
    # ========================================================

    species_data = {}

    for record in records:

        if not record.species_name:
            continue

        species = (
            record.species_name
            .strip()
            .title()
        )

        if species not in species_data:

            species_data[species] = {
                "population": 0,
                "locations": set(),
                "conservation_status": [],
                "observations": [],
            }

        # ----------------------------------------------------
        # POPULATION
        # ----------------------------------------------------

        count = (
            record.count
            if record.count and record.count > 0
            else 0
        )

        species_data[species]["population"] += count

        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        if record.location:

            species_data[species]["locations"].add(
                record.location.strip().lower()
            )

        # ----------------------------------------------------
        # CONSERVATION STATUS
        # ----------------------------------------------------

        if record.conservation_status:

            species_data[species][
                "conservation_status"
            ].append(
                record.conservation_status
                .strip()
                .lower()
            )

        # ----------------------------------------------------
        # POPULATION OBSERVATION
        # ----------------------------------------------------

        species_data[species]["observations"].append(
            count
        )

    # ========================================================
    # ANALYZE CONSERVATION PRIORITY
    # ========================================================

    priority_species = []

    for species, data in species_data.items():

        population = data["population"]

        locations_count = len(
            data["locations"]
        )

        observations = data[
            "observations"
        ]

        # ====================================================
        # DETERMINE POPULATION TREND
        # ====================================================

        if len(observations) < 2:

            trend = "Insufficient Data"

        else:

            previous = observations[-2]

            current = observations[-1]

            if current > previous:

                trend = "Increasing"

            elif current < previous:

                trend = "Declining"

            else:

                trend = "Stable"

        # ====================================================
        # GET CONSERVATION STATUS
        # ====================================================

        statuses = data[
            "conservation_status"
        ]

        if statuses:

            conservation_status = statuses[-1]

        else:

            conservation_status = "not evaluated"

        # ====================================================
        # CALCULATE PRIORITY SCORE
        # ====================================================

        priority_score = 0

        # ----------------------------------------------------
        # POPULATION SCORE
        # ----------------------------------------------------

        if population <= 5:

            priority_score += 35

        elif population <= 20:

            priority_score += 25

        elif population <= 50:

            priority_score += 15

        else:

            priority_score += 5

        # ----------------------------------------------------
        # CONSERVATION STATUS SCORE
        # ----------------------------------------------------

        status_scores = {

            "critically endangered": 40,

            "endangered": 35,

            "vulnerable": 25,

            "near threatened": 15,

            "least concern": 5,

            "not evaluated": 10,

        }

        priority_score += status_scores.get(

            conservation_status,

            10

        )

        # ----------------------------------------------------
        # DISTRIBUTION SCORE
        # ----------------------------------------------------

        if locations_count == 1:

            priority_score += 15

        elif locations_count <= 3:

            priority_score += 10

        else:

            priority_score += 5

        # ====================================================
        # TREND ADJUSTMENT
        # ====================================================

        if trend == "Declining":

            priority_score += 10

        elif trend == "Increasing":

            priority_score -= 5

        # ====================================================
        # LIMIT SCORE TO 100
        # ====================================================

        priority_score = max(

            0,

            min(

                priority_score,

                100

            )

        )

        # ====================================================
        # DETERMINE PRIORITY LEVEL
        # ====================================================

        if priority_score >= 75:

            priority_level = "Critical"

        elif priority_score >= 55:

            priority_level = "High"

        elif priority_score >= 35:

            priority_level = "Medium"

        else:

            priority_level = "Low"

        # ====================================================
        # ADD RESULT
        # ====================================================

        priority_species.append({

            "species": species,

            "population": population,

            "locations": locations_count,

            "trend": trend,

            "conservation_status": (
                conservation_status.title()
            ),

            "priority_score": priority_score,

            "priority_level": priority_level,

        })

    # ========================================================
    # SORT BY PRIORITY SCORE
    # ========================================================

    priority_species.sort(

        key=lambda item:
        item["priority_score"],

        reverse=True

    )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "total_species_analyzed": len(
            priority_species
        ),

        "priority_species": priority_species,

    }