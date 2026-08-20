from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user

from app.services.habitat_service import (
    classify_habitat,
    get_habitat_classifications,
    detect_habitat_degradation,
    analyze_vegetation,
    monitor_environmental_conditions,
    predict_habitat_suitability,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(

    prefix="/habitat",

    tags=["Habitat Intelligence"],

)


# ============================================================
# HABITAT CLASSIFICATION
# ============================================================

@router.post(
    "/classify"
)
async def habitat_classification(

    location: str,

    habitat_type: str,

    area_km2: float | None = None,

    protected_area: bool = False,

    temperature: float | None = None,

    rainfall: float | None = None,

    vegetation_health: float | None = None,

    water_quality: float | None = None,

    current_user=Depends(
        get_current_user
    ),

):

    return await classify_habitat(

        location=location,

        habitat_type=habitat_type,

        area_km2=area_km2,

        protected_area=protected_area,

        temperature=temperature,

        rainfall=rainfall,

        vegetation_health=vegetation_health,

        water_quality=water_quality,

    )


# ============================================================
# GET ALL HABITAT CLASSIFICATIONS
# ============================================================

@router.get(
    "/classifications"
)
async def get_habitat_classification_list(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_habitat_classifications()

# ============================================================
# 8.2 HABITAT DEGRADATION DETECTION
# ============================================================

@router.post("/degradation")
async def habitat_degradation_detection(

    location: str,

    temperature: float | None = None,

    rainfall: float | None = None,

    vegetation_health: float | None = None,

    water_quality: float | None = None,

    protected_area: bool = False,

    current_user=Depends(
        get_current_user
    ),

):

    return await detect_habitat_degradation(

        location=location,

        temperature=temperature,

        rainfall=rainfall,

        vegetation_health=vegetation_health,

        water_quality=water_quality,

        protected_area=protected_area,

    )
# ============================================================
# 8.3 VEGETATION ANALYSIS
# ============================================================

@router.post("/vegetation/analyze")
async def vegetation_analysis(

    location: str,

    vegetation_health: float | None = None,

    rainfall: float | None = None,

    temperature: float | None = None,

    current_user=Depends(
        get_current_user
    ),

):

    return await analyze_vegetation(

        location=location,

        vegetation_health=vegetation_health,

        rainfall=rainfall,

        temperature=temperature,

    )

# ============================================================
# 8.4 ENVIRONMENTAL CONDITION MONITORING
# ============================================================

@router.post("/environment/monitor")
async def environmental_condition_monitoring(

    location: str,

    temperature: float | None = None,

    rainfall: float | None = None,

    vegetation_health: float | None = None,

    water_quality: float | None = None,

    current_user=Depends(
        get_current_user
    ),

):

    return await monitor_environmental_conditions(

        location=location,

        temperature=temperature,

        rainfall=rainfall,

        vegetation_health=vegetation_health,

        water_quality=water_quality,

    )

# ============================================================
# 8.5 HABITAT SUITABILITY PREDICTION
# ============================================================

@router.get(
    "/suitability"
)
async def habitat_suitability(
    current_user=Depends(
        get_current_user
    ),
):

    return await predict_habitat_suitability()