"""
CIVIS — Demo & Acts Router
Endpoints for triggering the 4-act CIVIS adaptation story:
  - Act I:   The City Knows (INC-001, 4 agents, 11 events)
  - Act II:  The City Doesn't Know (INC-002, capability gap)
  - Act III: The City Adapts (forge, evaluate, repair, govern)
  - Act IV:  The City Has Grown (5-agent swarm, persistence)
"""
import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from engines.act1 import get_act1_orchestrator, Act1Orchestrator

logger = logging.getLogger("civis.demo")
router = APIRouter(prefix="/demo", tags=["Demo"])


class ActRunRequest(BaseModel):
    sync: bool = Field(default=False, description="Whether to wait for completion before returning")
    delay: Optional[float] = Field(None, description="Pacing delay in seconds between events")


@router.post("/act1", response_model=dict)
async def run_act1(
    payload: Optional[ActRunRequest] = None,
    db: Session = Depends(get_db),
    orchestrator: Act1Orchestrator = Depends(get_act1_orchestrator),
):
    """
    Trigger Act I: 'The City Knows'.
    INC-001 Monsoon Waterlogging is handled by the 4-agent city workforce.
    Emits 11 SSE events ending in INCIDENT_RESOLVED.
    """
    sync_mode = payload.sync if payload else False
    delay_override = payload.delay if payload else None

    # If delay is overridden, create custom orchestrator
    if delay_override is not None:
        orchestrator = Act1Orchestrator(delay=delay_override)

    if sync_mode:
        # Await completion directly (ideal for tests and automated pipelines)
        result = await orchestrator.run(db=db)
        return {"status": "completed", **result}
    else:
        # Launch in background so client can immediately listen on SSE /events/stream
        asyncio.create_task(orchestrator.run())
        return {
            "status": "started",
            "act": "I",
            "incident_id": "INC-001",
            "message": "Act I started in background. Stream events at /events/stream?incident_id=INC-001",
        }
