from fastapi import APIRouter
from app.api.v1 import (
    auth,
    users,
    surveys,
    monitoring_sites,
    camera_traps,
    audio_sensors,
    observations,
    media,
    dashboard,
    files,
    predict,
    species,
    ecological,
    population,
    recommendation,
    reports,
    notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(surveys.router, prefix="/surveys", tags=["surveys"])
api_router.include_router(monitoring_sites.router, prefix="/monitoring-sites", tags=["monitoring-sites"])
api_router.include_router(camera_traps.router, prefix="/camera-traps", tags=["camera-traps"])
api_router.include_router(audio_sensors.router, prefix="/audio-sensors", tags=["audio-sensors"])
api_router.include_router(observations.router, prefix="/observations", tags=["observations"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(predict.router, prefix="/predict", tags=["predict"])
api_router.include_router(species.router, prefix="/species", tags=["species"])
api_router.include_router(ecological.router, prefix="/ecological", tags=["ecological"])
api_router.include_router(population.router, prefix="/population", tags=["population"])
api_router.include_router(recommendation.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
