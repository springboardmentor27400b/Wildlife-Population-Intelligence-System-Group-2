from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.auth.security import hash_password
from app.database.database import Base, SessionLocal, engine
from app.models import user, monitoring_site, survey, wildlife_image, wildlife_audio, species, observation
# Milestone 3 model imports (ensures tables are created)
from app.models import population, habitat, conservation, ecosystem
from app.models.monitoring_site import MonitoringSite
from app.models.species import Species
from app.models.survey import Survey
from app.models.user import User
from app.models.wildlife_audio import WildlifeAudio
from app.models.wildlife_image import WildlifeImage
from app.routes import auth, monitoring_sites, observations, surveys, uploads, species as species_routes, dashboard, ai, datasets
# Milestone 3 route imports
from app.routes import population as population_routes, habitat as habitat_routes, conservation as conservation_routes, ecosystem as ecosystem_routes, intelligence as intelligence_routes
# Milestone 4 route imports
from app.routes import analytics as analytics_routes, reports_advanced as reports_advanced_routes, gis as gis_routes, predictions as predictions_routes, system_health as system_health_routes
from app.services.dataset_ingestion_service import ingest_dataset_metadata
from app.services.model_manager import model_manager
from app.services.storage_service import ensure_upload_directories
from app.utils.logging import configure_logging

configure_logging()


def seed_demo_data() -> None:
    db: Session = SessionLocal()
    try:
        researcher_user = db.query(User).filter(User.email == "researcher@example.com").first()
        if not researcher_user:
            researcher_user = User(
                full_name="Researcher",
                email="researcher@example.com",
                password_hash=hash_password("password123"),
                role="wildlife_researcher",
            )
            db.add(researcher_user)
        else:
            researcher_user.password_hash = hash_password("password123")
            db.add(researcher_user)

        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                full_name="Admin",
                email="admin@example.com",
                password_hash=hash_password("admin123"),
                role="admin",
            )
            db.add(admin_user)
        else:
            admin_user.password_hash = hash_password("admin123")
            db.add(admin_user)

        viewer_user = db.query(User).filter(User.email == "viewer@example.com").first()
        if not viewer_user:
            viewer_user = User(
                full_name="Viewer",
                email="viewer@example.com",
                password_hash=hash_password("viewer123"),
                role="viewer",
            )
            db.add(viewer_user)
        else:
            viewer_user.password_hash = hash_password("viewer123")
            db.add(viewer_user)

        db.flush()

        site_defs = [
            ("Riverbank Transect", 12.3456, 45.6789, "Riverine forest", "Kenya"),
            ("Savanna Loop", 12.3521, 45.6823, "Open grassland", "Kenya"),
            ("Misty Ridge Corridor", 13.1024, 46.0102, "Montane forest", "Kenya"),
            ("Tiger Watch Sanctuary", 11.9401, 44.8203, "Mangrove wetland", "India"),
        ]

        if db.query(MonitoringSite).count() == 0:
            db.add_all([
                MonitoringSite(site_name=name, latitude=lat, longitude=lon, habitat=habitat, country=country)
                for name, lat, lon, habitat, country in site_defs
            ])
            db.flush()

        species_defs = [
            ("African Elephant", "Loxodonta africana", "Mammal", "Endangered"),
            ("Masai Giraffe", "Giraffa camelopardalis tippelskirchi", "Mammal", "Vulnerable"),
            ("African Fish Eagle", "Haliaeetus vocifer", "Bird", "Least Concern"),
            ("Bengal Tiger", "Panthera tigris tigris", "Mammal", "Endangered"),
            ("Indian Leopard", "Panthera pardus fusca", "Mammal", "Vulnerable"),
            ("Great Hornbill", "Buceros bicornis", "Bird", "Vulnerable"),
        ]

        if db.query(Species).count() == 0:
            db.add_all([
                Species(common_name=name, scientific_name=scientific_name, category=category, iucn_status=iucn_status)
                for name, scientific_name, category, iucn_status in species_defs
            ])
            db.flush()

        site_map = {site.site_name: site.id for site in db.query(MonitoringSite).all()}
        species_map = {spec.common_name: spec.id for spec in db.query(Species).all()}

        if db.query(Survey).count() == 0:
            survey_details = [
                ("Riverbank Transect", date(2026, 7, 10), "Camera Trap v2", "High activity near riverbank during dawn monitoring."),
                ("Savanna Loop", date(2026, 7, 11), "Acoustic Sensor A1", "Prairie wind and repeated calls from a distant raptor."),
                ("Misty Ridge Corridor", date(2026, 7, 12), "Trail Camera Pro", "Dense forest signs of hornbill nesting activity."),
                ("Tiger Watch Sanctuary", date(2026, 7, 13), "Wildlife Drone X", "Tiger-like movement pattern observed near mangrove edge."),
            ]

            for site_name, survey_date, device, remarks in survey_details:
                site_id = site_map.get(site_name)
                if not site_id:
                    continue

                survey = Survey(
                    site_id=site_id,
                    user_id=researcher_user.id,
                    survey_date=survey_date,
                    device=device,
                    remarks=remarks,
                )
                db.add(survey)
                db.flush()

                if survey_date == date(2026, 7, 10):
                    db.add_all(
                        [
                            WildlifeImage(survey_id=survey.id, image_path="uploads/demo-elephant.jpg", species="African Elephant", confidence="0.96"),
                            WildlifeAudio(survey_id=survey.id, audio_path="uploads/demo-eagle.wav", species="African Fish Eagle"),
                        ]
                    )
                elif survey_date == date(2026, 7, 13):
                    db.add_all(
                        [
                            WildlifeImage(survey_id=survey.id, image_path="uploads/demo-tiger.jpg", species="Bengal Tiger", confidence="0.94"),
                            WildlifeAudio(survey_id=survey.id, audio_path="uploads/demo-tiger-call.wav", species="Bengal Tiger"),
                        ]
                    )
                else:
                    db.add(WildlifeImage(survey_id=survey.id, image_path="uploads/demo-giraffe.jpg", species="Masai Giraffe", confidence="0.91"))

        if db.query(observation.Observation).count() == 0:
            demo_observations = [
                ("African Elephant", "Riverbank Transect", date(2026, 7, 10), 4),
                ("African Fish Eagle", "Riverbank Transect", date(2026, 7, 10), 2),
                ("Masai Giraffe", "Savanna Loop", date(2026, 7, 11), 8),
                ("Great Hornbill", "Misty Ridge Corridor", date(2026, 7, 12), 3),
                ("Bengal Tiger", "Tiger Watch Sanctuary", date(2026, 7, 13), 1),
                ("Indian Leopard", "Tiger Watch Sanctuary", date(2026, 7, 14), 2),
                ("African Elephant", "Savanna Loop", date(2026, 7, 12), 1),
                ("Masai Giraffe", "Riverbank Transect", date(2026, 7, 13), 5),
                ("Great Hornbill", "Savanna Loop", date(2026, 7, 14), 4),
                ("African Fish Eagle", "Misty Ridge Corridor", date(2026, 7, 12), 1),
            ]
            for species_name, site_name, observation_date, count in demo_observations:
                species_id = species_map.get(species_name)
                site_id = site_map.get(site_name)
                if species_id is not None and site_id is not None:
                    db.add(
                        observation.Observation(
                            species_id=species_id,
                            site_id=site_id,
                            observation_date=observation_date,
                            count=count,
                        )
                    )
            db.flush()

        # Seed Taxonomy table if empty to satisfy taxonomy queries
        from app.models.taxonomy import Taxonomy
        from scripts.fetch_taxonomy import REAL_TAXONOMY
        if db.query(Taxonomy).count() == 0:
            for common_name, tax_data in REAL_TAXONOMY.items():
                db.add(
                    Taxonomy(
                        common_name=common_name,
                        scientific_name=tax_data["scientific_name"],
                        family=tax_data["family"],
                        genus=tax_data["genus"],
                        habitat=tax_data["habitat"],
                        diet=tax_data["diet"],
                        average_lifespan=tax_data["average_lifespan"],
                        iucn_status=tax_data["iucn_status"],
                        species_image=None,
                        gbif_id=None
                    )
                )
            db.flush()

        # Seed complete SQLite database with all required records
        from app.database.seed_full import seed_complete_database
        seed_complete_database(db)

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    import logging
    logger = logging.getLogger("app.startup")
    logger.info("Application startup initiated.")
    try:
        logger.info("Running database migrations...")
        run_db_migrations()
        logger.info("Seeding demo data into database...")
        seed_demo_data()
        logger.info("Demo data seeded successfully.")
        
        logger.info("Ensuring upload directories exist...")
        ensure_upload_directories()
        
        logger.info("AI models will load lazily on first inference request.")
        logger.info("Ingesting dataset metadata...")
        with SessionLocal() as db:
            ingest_dataset_metadata(db)
            
        logger.info("Application startup completed successfully.")
        yield
    except Exception as e:
        logger.exception(f"Application startup failed: {e}")
        raise
    finally:
        logger.info("Application shutdown initiated.")


from fastapi.staticfiles import StaticFiles
from app.services.storage_service import UPLOAD_ROOT, ensure_upload_directories

import os
default_cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:80",
    "http://localhost",
    "https://wildlife-frontend-kjbn.onrender.com",
    "https://wildlife-frontend.onrender.com",
]
env_cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
configured_origins = list(dict.fromkeys(default_cors_origins + env_cors_origins))

app = FastAPI(title="Wildlife Population Intelligence System", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

from sqlalchemy import text
def run_db_migrations():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE image_detections ADD COLUMN thumbnail_path VARCHAR(500);"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE audio_detections ADD COLUMN thumbnail_path VARCHAR(500);"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP;"))
            conn.commit()
        except Exception:
            pass
        for col in ["kingdom", "phylum", "class_name", "order_name"]:
            try:
                conn.execute(text(f"ALTER TABLE taxonomy ADD COLUMN {col} VARCHAR(100);"))
                conn.commit()
            except Exception:
                pass

run_db_migrations()
ensure_upload_directories()

from pathlib import Path
DATASETS_ROOT = Path(__file__).resolve().parent.parent.parent / "datasets"

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="api_uploads")
app.mount("/api/datasets_static", StaticFiles(directory=str(DATASETS_ROOT)), name="api_datasets_static")

app.include_router(auth.router, prefix="/api")
app.include_router(monitoring_sites.router, prefix="/api")
app.include_router(observations.router, prefix="/api")
app.include_router(surveys.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(species_routes.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(ai.biodiversity_router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(datasets.alt_router, prefix="/api")
# Milestone 3 routers
app.include_router(population_routes.router, prefix="/api")
app.include_router(habitat_routes.router, prefix="/api")
app.include_router(conservation_routes.router, prefix="/api")
app.include_router(ecosystem_routes.router, prefix="/api")
app.include_router(intelligence_routes.router, prefix="/api")
app.include_router(analytics_routes.router, prefix="/api")
app.include_router(reports_advanced_routes.router, prefix="/api")
app.include_router(gis_routes.router, prefix="/api")
app.include_router(predictions_routes.router, prefix="/api")
app.include_router(system_health_routes.router, prefix="/api")

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok", "message": "Wildlife Population Intelligence System API is running"}


@app.get("/api/models/status")
def model_status() -> dict:
    from dataclasses import asdict
    return asdict(model_manager.get_status())


@app.get("/api/biodiversity/confidence-trend")
def api_biodiversity_confidence_trend():
    from app.models.image_detection import ImageDetection
    from app.models.audio_detection import AudioDetection
    from app.services.ai_service import build_biodiversity_summary
    db_session = SessionLocal()
    try:
        image_detections = db_session.query(ImageDetection).all()
        audio_detections = db_session.query(AudioDetection).all()
        image_payload = [{"species": item.species, "confidence": item.confidence, "created_at": str(item.detection_date or item.created_at)} for item in image_detections]
        audio_payload = [{"species": item.species, "confidence": item.confidence, "created_at": str(item.detection_date or item.created_at)} for item in audio_detections]
        summary = build_biodiversity_summary(image_payload, audio_payload, [])
        return summary.get("confidence_trend", [])
    finally:
        db_session.close()


@app.get("/api/biodiversity/daily-velocity")
def api_biodiversity_daily_velocity():
    from app.models.image_detection import ImageDetection
    from app.models.audio_detection import AudioDetection
    from app.services.ai_service import build_biodiversity_summary
    db_session = SessionLocal()
    try:
        image_detections = db_session.query(ImageDetection).all()
        audio_detections = db_session.query(AudioDetection).all()
        image_payload = [{"species": item.species, "confidence": item.confidence, "created_at": str(item.detection_date or item.created_at)} for item in image_detections]
        audio_payload = [{"species": item.species, "confidence": item.confidence, "created_at": str(item.detection_date or item.created_at)} for item in audio_detections]
        summary = build_biodiversity_summary(image_payload, audio_payload, [])
        return summary.get("daily_trends", [])
    finally:
        db_session.close()


@app.get("/api/biodiversity/monthly-velocity")
def api_biodiversity_monthly_velocity():
    from app.models.image_detection import ImageDetection
    from app.models.audio_detection import AudioDetection
    from app.services.ai_service import build_biodiversity_summary
    db_session = SessionLocal()
    try:
        image_detections = db_session.query(ImageDetection).all()
        audio_detections = db_session.query(AudioDetection).all()
        image_payload = [{"species": item.species, "confidence": item.confidence, "created_at": str(item.detection_date or item.created_at)} for item in image_detections]
        audio_payload = [{"species": item.species, "confidence": item.confidence, "created_at": str(item.detection_date or item.created_at)} for item in audio_detections]
        summary = build_biodiversity_summary(image_payload, audio_payload, [])
        return summary.get("monthly_trends", [])
    finally:
        db_session.close()
