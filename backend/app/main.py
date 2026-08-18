import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db_connection
from app.api.endpoints import auth, profile, sites, surveys, devices, observations, dashboard, news, analytics, admin, ecosystem_health, reports, alerts
from app.services.ai import ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Perform database connection verification on startup
    init_db_connection()
    yield

app = FastAPI(
    title="Wildlife Population Intelligence System API",
    description="Backend services and AI analysis pipelines for biodiversity monitoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

frontend_env = os.getenv("FRONTEND_URL") or os.getenv("ALLOWED_ORIGINS")
if frontend_env:
    for origin in frontend_env.split(","):
        clean_origin = origin.strip().rstrip("/")
        if clean_origin and clean_origin not in allowed_origins:
            allowed_origins.append(clean_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def vercel_routing_middleware(request, call_next):
    raw_path_param = request.query_params.get("_path")
    if raw_path_param is not None:
        if raw_path_param in ["docs", "openapi.json", "redoc"]:
            request.scope["path"] = f"/{raw_path_param}"
        elif raw_path_param == "" or raw_path_param == "/":
            request.scope["path"] = "/api"
        else:
            clean_p = raw_path_param.lstrip("/")
            request.scope["path"] = f"/api/{clean_p}"
    elif request.scope.get("path") in ["/api/index.py", "/index.py"]:
        request.scope["path"] = "/api"
    return await call_next(request)


# Router attachments
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["User Profile"])
app.include_router(sites.router, prefix="/api/sites", tags=["Monitoring Sites"])
app.include_router(surveys.router, prefix="/api/surveys", tags=["Surveys"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(observations.router, prefix="/api/observations", tags=["Observations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(news.router, prefix="/api/news", tags=["Wildlife News"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(ecosystem_health.router, prefix="/api/ecosystem-health", tags=["Ecosystem Health"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Administration"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports & Export"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Notifications & Alerts"])
app.include_router(ai_router.router, prefix="/api/ai", tags=["AI Inference"])


# Static frontend asset mounting for production & serverless environments
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_path = os.path.join(dist_path, "assets")

if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")


@app.get("/")
def read_root():
    index_file = os.path.join(dist_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Welcome to Wildlife Population Intelligence System API"}


@app.get("/favicon.svg")
def get_favicon():
    fav = os.path.join(dist_path, "favicon.svg")
    if os.path.exists(fav):
        return FileResponse(fav, media_type="image/svg+xml")
    from fastapi import Response
    return Response(status_code=404)


@app.get("/icons.svg")
def get_icons():
    icons = os.path.join(dist_path, "icons.svg")
    if os.path.exists(icons):
        return FileResponse(icons, media_type="image/svg+xml")
    from fastapi import Response
    return Response(status_code=404)



@app.get("/api")
@app.get("/api/")
def read_api_root():
    return {"message": "Welcome to Wildlife Population Intelligence System API"}


from fastapi import Request

@app.get("/api/debug-path")
def debug_path(request: Request):
    return {
        "scope_path": request.scope.get("path"),
        "raw_path": str(request.scope.get("raw_path")),
        "headers": dict(request.headers)
    }

