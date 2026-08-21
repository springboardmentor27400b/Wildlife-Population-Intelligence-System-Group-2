from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import Base, engine

from routers.auth import router as auth_router
from routers.dashboard import router as dashboard_router
from routers.species import router as species_router
from routers.observations import router as observations_router
from routers.upload import router as upload_router
from routers.survey import router as survey_router
from routers.image_analysis import router as image_analysis_router
from routers import audio_analysis
from routers import species_classification
from routers import biodiversity
from routers import export
from routers import population
from routers import biodiversity_intelligence
from routers import habitat
from routers import conservation
from routers import health

from routers.reports.wildlife_survey import router as wildlife_survey_router
from routers.reports.species_population import router as species_population_router
from routers.reports.biodiversity import router as biodiversity_router
from routers.reports.habitat import router as habitat_report_router
from routers.reports.conservation import router as conservation_report_router
from routers.notifications import router as notifications_router

from routers.protected_area import router as protected_area_router
from routers.wildlife_movement import router as wildlife_movement_router
from routers.patrol import router as patrol_router
from routers.incidents import router as incidents_router

from routers.admin_users import router as admin_users_router
from routers.monitoring import router as monitoring_router

# ==================================================
# Create Database Tables
# ==================================================

Base.metadata.create_all(bind=engine)

# ==================================================
# Create FastAPI App
# ==================================================

app = FastAPI(
    title="Wildlife Population Intelligence System API",
    version="1.0.0",
)

# ==================================================
# Create Required Folders
# ==================================================

os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/wildlife_images", exist_ok=True)
os.makedirs("uploads/wildlife_audio", exist_ok=True)
os.makedirs("static", exist_ok=True)

# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:8080",
    "https://wildlife-frontend.agreeablestone-2730e914.koreacentral.azurecontainerapps.io",
 ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# Static Files
# ==================================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)

# ==================================================
# Root
# ==================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to Wildlife Population Intelligence System API"
    }

# ==================================================
# Routers
# ==================================================

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(species_router)
app.include_router(observations_router)
app.include_router(upload_router)
app.include_router(survey_router)
app.include_router(image_analysis_router)
app.include_router(audio_analysis.router)
app.include_router(species_classification.router)
app.include_router(biodiversity.router)
app.include_router(export.router)
app.include_router(population.router)
app.include_router(biodiversity_intelligence.router)
app.include_router(habitat.router)
app.include_router(conservation.router)
app.include_router(health.router)

app.include_router(wildlife_survey_router)
app.include_router(species_population_router)
app.include_router(biodiversity_router)
app.include_router(habitat_report_router)
app.include_router(conservation_report_router)
app.include_router(notifications_router)
app.include_router(protected_area_router)
app.include_router(wildlife_movement_router)
app.include_router(patrol_router)
app.include_router(incidents_router)
app.include_router(admin_users_router)
app.include_router(monitoring_router)