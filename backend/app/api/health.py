from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user

from app.services.health_service import (
    get_biodiversity_score,
    get_habitat_quality_score,
    get_species_conservation_score,
    get_population_stability_score,
    get_ecosystem_health_score,
)

router = APIRouter(

    prefix="/health",

    tags=["Wildlife Health Scoring Engine"]

)


@router.get("/biodiversity-score")
async def biodiversity_score(

    current_user=Depends(get_current_user),

):

    return await get_biodiversity_score()

# ============================================================
# 10.2 HABITAT QUALITY SCORE
# ============================================================

@router.get("/habitat-score")
async def habitat_quality_score(

    current_user=Depends(get_current_user),

):

    return await get_habitat_quality_score()

# ============================================================
# 10.3 SPECIES CONSERVATION SCORE
# ============================================================

@router.get("/conservation-score")
async def conservation_score(

    current_user=Depends(get_current_user),

):

    return await get_species_conservation_score()
# ============================================================
# 10.4 POPULATION STABILITY SCORE
# ============================================================

@router.get("/population-stability")
async def population_stability_score(

    current_user=Depends(get_current_user),

):

    return await get_population_stability_score()

# ============================================================
# 10.5 ECOSYSTEM HEALTH SCORE
# ============================================================

@router.get("/ecosystem")
async def ecosystem_health(

    current_user=Depends(get_current_user),

):

    return await get_ecosystem_health_score()