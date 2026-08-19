import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core import ai_config
from app.core.logging_config import setup_logging
from app.core.middleware import RequestLoggingMiddleware
from app.api.router import api_router

# Setup logging config
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Timing and request-response logger middleware
app.add_middleware(RequestLoggingMiddleware)

# Ensure local upload directories exist and mount static paths
uploads_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.UPLOAD_DIR)
os.makedirs(uploads_path, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Include master API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # Skip seeding during automated tests
    if os.getenv("TESTING") == "True":
        return
        
    from app.core.database import SessionLocal
    from app.core.seeder import seed_db
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

@app.get("/")
def root_endpoint():
    return {
        "message": "Welcome to Wildlife Population Intelligence System API",
        "status": "online",
        "milestone": 1
    }

