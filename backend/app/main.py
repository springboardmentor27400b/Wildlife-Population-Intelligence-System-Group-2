from contextlib import asynccontextmanager
from app.api.auth import router as auth_router
from app.api.monitoring import router as monitoring_router
from fastapi import FastAPI

from app.core.config import settings
from app.core.db import close_db, init_db
from app.api import auth, monitoring

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
app.include_router(auth.router)
app.include_router(monitoring.router)
app.include_router(auth_router)
app.include_router(monitoring_router)
@app.get("/")
async def home():
    return {
        "message": "Wildlife Population Intelligence System API is running!",
        "database": settings.MONGO_DB_NAME,
    }