from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user

from app.services.conservation_service import (
    get_conservation_priority_recommendations,
    get_habitat_restoration_suggestions,
    get_wildlife_protection_strategies,
    get_monitoring_optimization,
)

router = APIRouter(
    prefix="/conservation",
    tags=["Conservation Recommendation Engine"],
)


@router.get("/priority")
async def conservation_priority(
    current_user=Depends(get_current_user),
):
    return await get_conservation_priority_recommendations()

# ============================================================
# 9.2 HABITAT RESTORATION SUGGESTIONS
# ============================================================

@router.get("/restoration")
async def habitat_restoration(
    current_user=Depends(get_current_user),
):

    return await get_habitat_restoration_suggestions()

# ============================================================
# 9.3 WILDLIFE PROTECTION STRATEGIES
# ============================================================

@router.get("/protection")
async def wildlife_protection(
    current_user=Depends(get_current_user),
):

    return await get_wildlife_protection_strategies()

# ============================================================
# 9.4 MONITORING OPTIMIZATION
# ============================================================

@router.get("/monitoring")
async def monitoring_optimization(

    current_user=Depends(get_current_user),

):

    return await get_monitoring_optimization()