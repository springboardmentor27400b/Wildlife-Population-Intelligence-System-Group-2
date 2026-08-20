from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user

from app.services.population_service import (
    get_population_overview,
    get_population_trends,
    get_species_population_ranking,
    get_population_alerts,
    get_migration_analysis,
    get_species_distribution,
    get_biodiversity_index,
    get_species_diversity_analysis,
    get_habitat_health_assessment,
    get_ecosystem_monitoring,
    get_conservation_priority_analysis,
)

# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/population",
    tags=["Population Intelligence"],
)


# ============================================================
# POPULATION OVERVIEW
# ============================================================

@router.get("/overview")
async def population_overview(
    current_user=Depends(get_current_user),
):
    """
    Return population intelligence overview.

    Includes:
    - Total population
    - Total wildlife observations
    - Species richness
    - Species-wise population
    - Species population percentages
    - Population by location
    - Most abundant species
    """

    return await get_population_overview()

@router.get("/trends")
async def population_trends(

    species: str | None = None,

    location: str | None = None,

    current_user=Depends(
        get_current_user
    ),

):

    return await get_population_trends(

        species=species,

        location=location,

    )
# ============================================================
# SPECIES POPULATION RANKING
# ============================================================

@router.get(
    "/ranking/species"
)
async def species_population_ranking(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_species_population_ranking()
# ============================================================
# POPULATION ALERTS & ANOMALY DETECTION
# ============================================================

@router.get(
    "/alerts"
)
async def population_alerts(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_population_alerts()
# ============================================================
# MIGRATION ANALYSIS
# ============================================================

@router.get(
    "/migration"
)
async def population_migration(

    species: str | None = None,

    location: str | None = None,

    current_user=Depends(
        get_current_user
    ),

):

    return await get_migration_analysis(

        species=species,

        location=location,

    )

# ============================================================
# SPECIES DISTRIBUTION MAPPING
# ============================================================

@router.get(
    "/distribution"
)
async def species_distribution(

    species: str | None = None,

    location: str | None = None,

    current_user=Depends(
        get_current_user
    ),

):

    return await get_species_distribution(

        species=species,

        location=location,

    )

# ============================================================
# BIODIVERSITY INDEX
# ============================================================

@router.get(
    "/biodiversity/index"
)
async def biodiversity_index(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_biodiversity_index()

# ============================================================
# SPECIES DIVERSITY ANALYSIS
# ============================================================

@router.get(
    "/biodiversity/diversity"
)
async def species_diversity_analysis(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_species_diversity_analysis()

# ============================================================
# HABITAT HEALTH ASSESSMENT
# ============================================================

@router.get(
    "/biodiversity/habitat-health"
)
async def habitat_health_assessment(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_habitat_health_assessment()

# ============================================================
# 7.4 ECOSYSTEM MONITORING
# ============================================================

@router.get(
    "/ecosystem/monitoring"
)
async def ecosystem_monitoring(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_ecosystem_monitoring()

# ============================================================
# CONSERVATION PRIORITY ANALYSIS — MODULE 7.5
# ============================================================

@router.get(
    "/biodiversity/conservation-priority"
)
async def conservation_priority_analysis(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_conservation_priority_analysis()