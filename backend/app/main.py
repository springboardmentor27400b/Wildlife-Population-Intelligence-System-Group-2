from pathlib import Path
from app.routers.audio_analysis import router as audio_analysis_router
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import app.models.base
from app.routers.image_analysis import router as image_analysis_router
from app.routers.auth import router as auth_router
from app.routers.species import router as species_router
from app.routers.protected_area import router as protected_area_router
from app.routers.wildlife_observation import (
    router as wildlife_observation_router,
)
from app.routers.wildlife_analysis import (
    router as wildlife_analysis_router,
)
from app.routers.milestone4_dashboard import router as milestone4_dashboard_router
from app.routers import protected_area_analytics
from app.routers import upload
from app.routers import audio_upload
from app.routers import dashboard
from app.routers import analytics
from app.routers import threat_detection
from app.routers import reports
from app.routers.species_classification import (
    router as species_classification_router,
)

app = FastAPI(
    title="Wildlife Population Intelligence System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Create uploads folder automatically
Path("uploads").mkdir(parents=True, exist_ok=True)

# Serve uploaded files
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)
app.include_router(audio_analysis_router)
app.include_router(
    protected_area_analytics.router
)
app.include_router(milestone4_dashboard_router)


# Register routers
app.include_router(species_classification_router)
app.include_router(auth_router)
app.include_router(species_router)
app.include_router(protected_area_router)
app.include_router(wildlife_observation_router)
app.include_router(upload.router)
app.include_router(threat_detection.router)
app.include_router(audio_upload.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(image_analysis_router)
app.include_router(reports.router)
app.include_router(
    wildlife_analysis_router
)
@app.get("/")
def root():
    return {
        "status": "Running",
        "project": "Wildlife Population Intelligence System",
    }