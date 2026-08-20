from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.dependencies.auth import (
    get_current_user,
)

from app.schemas.monitoring_site import (
    MonitoringSiteCreate,
)

from app.services.monitoring_site_service import (
    get_monitoring_sites,
    create_monitoring_site,
    get_monitoring_site,
    calculate_population_density,
    get_site_density_ranking,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/population/sites",
    tags=["Population Monitoring Sites"],
)


# ============================================================
# CREATE MONITORING SITE
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
async def create_site(

    site_data: MonitoringSiteCreate,

    current_user=Depends(
        get_current_user
    ),

):

    site = await create_monitoring_site(
        site_data
    )

    return {

        "message": (
            "Monitoring site created successfully."
        ),

        "site": site,

    }


# ============================================================
# GET ALL MONITORING SITES
# ============================================================

@router.get("/")
async def get_sites(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_monitoring_sites()

# ============================================================
# MONITORING SITE DENSITY RANKING
# ============================================================

@router.get(
    "/ranking/density"
)
async def site_density_ranking(

    current_user=Depends(
        get_current_user
    ),

):

    return await get_site_density_ranking()


# ============================================================
# GET SITE BY ID
# ============================================================

@router.get("/{site_id}")
async def get_site(

    site_id: str,

    current_user=Depends(
        get_current_user
    ),

):

    site = await get_monitoring_site(
        site_id
    )

    if not site:

        raise HTTPException(

            status_code=404,

            detail=(
                "Monitoring site not found."
            )

        )

    return site


# ============================================================
# GET POPULATION DENSITY
# ============================================================

@router.get("/{site_name}/density")
async def get_population_density(

    site_name: str,

    current_user=Depends(
        get_current_user
    ),

):

    result = await calculate_population_density(
        site_name
    )

    if not result:

        raise HTTPException(

            status_code=404,

            detail=(
                "Monitoring site not found."
            )

        )

    return result

