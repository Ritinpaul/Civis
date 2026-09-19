"""
CIVIS — FastAPI Application Entry Point
Phase 0: skeleton with /health only.
Routes are added incrementally per phase.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.settings import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    print(f"[CIVIS] Starting up — env={settings.environment}, demo_mode={settings.demo_mode}")
    print(f"[CIVIS] Gemini fast={settings.gemini_fast_model}, smart={settings.gemini_smart_model}")
    yield
    print("[CIVIS] Shutting down.")


app = FastAPI(
    title="CIVIS API",
    description="Cities that can adapt — AI workforce management system",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "service": "civis-api",
        "version": "0.1.0",
        "environment": settings.environment,
        "demo_mode": settings.demo_mode,
    }


# ── Routers added per phase ───────────────────────────────────────────────────
# Phase 2:  from routers import incidents, capabilities, workforce, events
# Phase 5:  capabilities router extended
# Phase 16: from routers import demo
