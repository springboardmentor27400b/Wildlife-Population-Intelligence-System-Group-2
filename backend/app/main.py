from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.monitoring import router as monitoring_router
from app.api.wildlife import router as wildlife_router
from app.api.dashboard import router as dashboard_router
from app.api.image import router as image_router
from app.api.audio import router as audio_router
from app.api.population import router as population_router
from app.api.population_site import (router as population_site_router)
from app.api.habitat import router as habitat_router
from app.api.conservation import (router as conservation_router)
from app.api.health import router as health_router
from app.api.alerts import router as alerts_router

from app.core.config import settings
from app.core.db import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Databases connected")

    yield

    await close_db()
    print("🔴 Databases disconnected")


app = FastAPI(
    title="Wildlife Population Intelligence System",
    description="Milestone 1 Backend API",
    version="1.0.0",
    lifespan=lifespan,
)


# =========================
# CORS CONFIGURATION
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# UPLOADS DIRECTORY
# =========================

uploads_directory = Path(__file__).resolve().parents[1] / "uploads"
uploads_directory.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=uploads_directory),
    name="uploads",
)


# =========================
# API ROUTES
# =========================

app.include_router(auth_router)
app.include_router(monitoring_router)
app.include_router(wildlife_router)
app.include_router(dashboard_router)
app.include_router(image_router)
app.include_router(audio_router)
app.include_router(population_site_router)
app.include_router(population_router)
app.include_router(habitat_router)
app.include_router(conservation_router)
app.include_router(health_router)
app.include_router(alerts_router)



# =========================
# HOME
# =========================

@app.get("/")
async def home():
    return {
        "message": "Wildlife Population Intelligence System API is running!",
        "database": settings.MONGO_DB_NAME,
    }


