from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.sites import router as sites_router
from app.api.devices import router as devices_router
from app.api.uploads import router as uploads_router
from app.api.observations import router as observations_router
from app.api.predictions import router as predictions_router
from app.api.audio_predictions import router as audio_predictions_router
from app.api.unified_predictions import router as unified_predictions_router
from app.api.biodiversity_analytics import router as biodiversity_analytics_router
from app.api.wildlife_reports import router as wildlife_reports_router
from app.api.dashboard import router as dashboard_router
from app.api.reports import router as reports_router
from app.api.map import router as map_router
from app.api.notifications import router as notifications_router
from app.api.settings import router as settings_router
from app.api.audit_logs import router as audit_logs_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sites_router, prefix="/sites", tags=["Monitoring Sites"])
api_router.include_router(devices_router, prefix="/devices", tags=["Sensor Devices"])
api_router.include_router(uploads_router, prefix="/uploads", tags=["Uploads"])
api_router.include_router(observations_router, prefix="/observations", tags=["Observations"])
api_router.include_router(predictions_router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(audio_predictions_router, prefix="/audio-predictions", tags=["Audio Predictions"])
api_router.include_router(unified_predictions_router, prefix="/unified-predictions", tags=["Unified Predictions"])
api_router.include_router(biodiversity_analytics_router, prefix="/biodiversity-analytics", tags=["Biodiversity Analytics"])
api_router.include_router(wildlife_reports_router, prefix="/wildlife-reports", tags=["Wildlife Reports"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(map_router, prefix="/map", tags=["Map"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_router.include_router(audit_logs_router, prefix="/audit-logs", tags=["Audit Logs"])