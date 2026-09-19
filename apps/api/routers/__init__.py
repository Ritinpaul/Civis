from routers.incidents import router as incidents_router
from routers.capabilities import router as capabilities_router
from routers.workforce import router as workforce_router
from routers.events import router as events_router

__all__ = [
    "incidents_router",
    "capabilities_router",
    "workforce_router",
    "events_router",
]
