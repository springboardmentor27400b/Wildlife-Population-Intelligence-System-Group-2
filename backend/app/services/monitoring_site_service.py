from beanie import PydanticObjectId

from app.models.monitoring_site import MonitoringSite
from app.models.wildlife import Wildlife
from app.schemas.monitoring_site import (
    MonitoringSiteCreate,
)


# ============================================================
# CREATE MONITORING SITE
# ============================================================

async def create_monitoring_site(
    site_data: MonitoringSiteCreate,
):

    site = MonitoringSite(
        **site_data.model_dump()
    )

    await site.insert()

    return site


# ============================================================
# GET ALL MONITORING SITES
# ============================================================

async def get_monitoring_sites():

    return await (
        MonitoringSite
        .find_all()
        .to_list()
    )


# ============================================================
# GET MONITORING SITE BY ID
# ============================================================

async def get_monitoring_site(
    site_id: str,
):

    try:

        site = await MonitoringSite.get(
            PydanticObjectId(site_id)
        )

    except Exception:

        site = None

    return site


# ============================================================
# CALCULATE POPULATION DENSITY
# ============================================================

async def calculate_population_density(
    site_name: str,
):

    # ========================================================
    # FIND MONITORING SITE
    # CASE-INSENSITIVE SEARCH
    # ========================================================

    all_sites = await (
        MonitoringSite
        .find_all()
        .to_list()
    )

    site = next(
        (
            item
            for item in all_sites
            if item.site_name.strip().lower()
            == site_name.strip().lower()
        ),
        None
    )

    if not site:

        return None

    # ========================================================
    # GET WILDLIFE RECORDS
    # ========================================================

    wildlife_records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    # ========================================================
    # FILTER RECORDS BY LOCATION
    # CASE-INSENSITIVE
    # ========================================================

    site_location = (
        site.location
        .strip()
        .lower()
    )

    site_records = [

        record

        for record in wildlife_records

        if record.location

        and record.location.strip().lower()
        == site_location

    ]

    # ========================================================
    # CALCULATE TOTAL POPULATION
    # ========================================================

    total_population = sum(

        record.count

        for record in site_records

        if record.count
        and record.count > 0

    )

    # ========================================================
    # CALCULATE OVERALL DENSITY
    # ========================================================

    overall_density = (

        total_population
        /
        site.area_km2

    )

    # ========================================================
    # CALCULATE SPECIES-WISE POPULATION
    # ========================================================

    species_population = {}

    for record in site_records:

        species = (
            record.species_name
            .strip()
            .title()
        )

        species_population[species] = (

            species_population.get(
                species,
                0
            )

            +

            record.count

        )

    # ========================================================
    # CALCULATE SPECIES-WISE DENSITY
    # ========================================================

    species_density = {}

    for species, population in (
        species_population.items()
    ):

        density = (

            population
            /
            site.area_km2

        )

        species_density[species] = {

            "population": population,

            "density": round(
                density,
                4
            ),

            "unit": "animals/km²",

        }

    # ========================================================
    # RETURN COMPLETE DENSITY ANALYSIS
    # ========================================================

    return {

        "site_name": site.site_name,

        "location": site.location,

        "area_km2": site.area_km2,

        "total_population": total_population,

        "overall_density": round(
            overall_density,
            4
        ),

        "unit": "animals/km²",

        "species_density": species_density,

        "habitat_type": site.habitat_type,

        "protected_area": site.protected_area,

    }

# ============================================================
# MONITORING SITE POPULATION DENSITY RANKING
# ============================================================

async def get_site_density_ranking():

    # ========================================================
    # GET ALL MONITORING SITES
    # ========================================================

    sites = await (
        MonitoringSite
        .find_all()
        .to_list()
    )

    # ========================================================
    # GET ALL WILDLIFE RECORDS
    # ========================================================

    wildlife_records = await (
        Wildlife
        .find_all()
        .to_list()
    )

    ranking = []

    # ========================================================
    # CALCULATE DENSITY FOR EACH SITE
    # ========================================================

    for site in sites:

        site_location = (
            site.location
            .strip()
            .lower()
        )

        # ----------------------------------------------------
        # FIND WILDLIFE RECORDS FOR THIS SITE
        # ----------------------------------------------------

        site_records = [

            record

            for record in wildlife_records

            if record.location

            and record.location.strip().lower()
            == site_location

        ]

        # ----------------------------------------------------
        # CALCULATE TOTAL POPULATION
        # ----------------------------------------------------

        total_population = sum(

            record.count

            for record in site_records

            if record.count
            and record.count > 0

        )

        # ----------------------------------------------------
        # CALCULATE DENSITY
        # ----------------------------------------------------

        if site.area_km2 > 0:

            density = (

                total_population
                /
                site.area_km2

            )

        else:

            density = 0

        # ----------------------------------------------------
        # ADD TO RANKING
        # ----------------------------------------------------

        ranking.append({

            "site_name": site.site_name,

            "location": site.location,

            "area_km2": site.area_km2,

            "total_population": total_population,

            "population_density": round(
                density,
                4
            ),

            "unit": "animals/km²",

        })

    # ========================================================
    # SORT BY DENSITY
    # HIGHEST → LOWEST
    # ========================================================

    ranking.sort(

        key=lambda item:
        item["population_density"],

        reverse=True

    )

    # ========================================================
    # ADD RANK NUMBERS
    # ========================================================

    for index, item in enumerate(
        ranking,
        start=1
    ):

        item["rank"] = index

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "total_sites": len(
            ranking
        ),

        "ranking": ranking,

    }