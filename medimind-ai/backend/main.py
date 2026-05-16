"""
MediMind AI — FastAPI Application Entry Point
"""
import os
os.environ.pop("SSLKEYLOGFILE", None)

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from core.config import get_settings
from database import init_db
from routes import auth, medicines, agents, alerts

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print(f"[MediMind] {settings.APP_NAME} started - {settings.APP_ENV} mode")
    yield
    # Shutdown
    print(f"[MediMind] {settings.APP_NAME} shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="Self-Evolving Multi-Agent Medical Inventory Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ─── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(medicines.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}
