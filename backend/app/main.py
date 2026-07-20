from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.db import init_db
from app.api.router import api_router
from app.utils.logger import logger
from fastapi.staticfiles import StaticFiles
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    from app.core.seed import seed_roles
    await seed_roles()
    
    # Load ML Model
    try:
        from app.ml.predictor import _load_resources
        _load_resources()
        logger.info("AI Species Recognition model loaded successfully.")
    except Exception as e:
        logger.warning(f"AI model could not be loaded at startup: {e}")
        
    yield
    # Shutdown
    pass

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
    version="1.0.0"
)

# Configure CORS origins
cors_origins = [origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",")] if settings.BACKEND_CORS_ORIGINS else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Unhandled Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception occurred",
        path=request.url.path,
        method=request.method,
        error=str(exc)
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please contact the system administrator."}
    )

@app.get("/health", tags=["health"])
async def health_check():
    try:
        from app.models.user import User
        # Quick query to verify database connectivity
        await User.find_one()
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
        
    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "version": app.version,
        "database": db_status
    }

app.include_router(api_router, prefix=settings.API_V1_STR)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
