from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app import models
from app.routers import users, surveys, monitoring, observations
from fastapi.staticfiles import StaticFiles
from app.routers import ai_analysis
from app.routers import analytics
from app.routers import audio_analysis
from app.routers import dashboard
from app.routers import population
from app.routers import trend
from app.routers import migration
from app.routers import distribution
from app.routers import dashboard1
from app.routers import alerts
from app.routers import report

from app.routers import biodiversity
from app.routers import habitat
from app.routers import conservation

from app.routers import health


models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wildlife Population Intelligence System API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(surveys.router)
app.include_router(monitoring.router)
app.include_router(observations.router)
app.include_router(ai_analysis.router)
app.include_router(analytics.router)
app.include_router(audio_analysis.router)
app.include_router(dashboard.router)
app.include_router(population.router)
app.include_router(trend.router)
app.include_router(migration.router)
app.include_router(distribution.router)
app.include_router(dashboard1.router)
app.include_router(report.router)
app.include_router(alerts.router)
app.include_router(biodiversity.router)
app.include_router(habitat.router)
app.include_router(conservation.router)
app.include_router(health.router)
@app.get("/")
def home():
    return {"message": "Welcome to Wildlife Population Intelligence System API"}

@app.get("/health")
def health():
    return {"status": "Running Successfully"}
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)
