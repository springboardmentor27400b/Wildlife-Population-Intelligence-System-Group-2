from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user

from app.services.alert_service import (
    get_all_alerts,
    get_alert_summary,
)


router = APIRouter(
    prefix="/alerts",
    tags=["Notifications & Alerts"],
)


@router.get("/")
async def alerts(
    current_user=Depends(
        get_current_user
    ),
):
    """
    Return all live-generated WPIS alerts.
    """

    return {
        "alerts": await get_all_alerts()
    }


@router.get("/summary")
async def alert_summary(
    current_user=Depends(
        get_current_user
    ),
):
    """
    Return alert counts by severity
    and category.
    """

    return await get_alert_summary()


@router.get("/category/{category}")
async def alerts_by_category(
    category: str,
    current_user=Depends(
        get_current_user
    ),
):

    alerts = await get_all_alerts()

    filtered = [
        alert
        for alert in alerts
        if alert.get("category") == category
    ]

    return {
        "category": category,
        "alerts": filtered,
    }