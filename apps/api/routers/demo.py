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


class Act2RunRequest(BaseModel):
    sync: bool = Field(default=False, description="Whether to wait for completion before returning")
    delay: Optional[float] = Field(None, description="Pacing delay in seconds between events")
    auto_forge: bool = Field(default=False, description="Whether to automatically trigger Phase 8 (Forge) upon gap detection")


@router.post("/act2", response_model=dict)
async def run_act2(
    payload: Optional[Act2RunRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Trigger Act II: 'The City Doesn't Know'.
    INC-002 Unknown Road Anomaly causes workforce to attempt and declare INSUFFICIENT.
    Emits CAPABILITY_GAP (the hero moment) and optionally triggers Phase 8 (Forge).
    """
    from engines.act2 import Act2Orchestrator, get_act2_orchestrator

    sync_mode = payload.sync if payload else False
    delay_override = payload.delay if payload else None
    auto_forge = payload.auto_forge if payload else False

    orchestrator = Act2Orchestrator(delay=delay_override) if delay_override is not None else get_act2_orchestrator()

    if sync_mode:
        result = await orchestrator.run(db=db, auto_forge=auto_forge)
        return {"status": "completed", **result}
    else:
        asyncio.create_task(orchestrator.run(auto_forge=auto_forge))
        return {
            "status": "started",
            "act": "II",
            "incident_id": "INC-002",
            "message": "Act II started in background. Stream events at /events/stream?incident_id=INC-002",
        }


class Act3RunRequest(BaseModel):
    sync: bool = Field(default=False, description="Whether to wait for completion before returning")
    delay: Optional[float] = Field(None, description="Pacing delay in seconds between events")
    incident_id: str = Field(default="INC-002", description="Incident ID to coordinate swarm for")


@router.post("/act3", response_model=dict)
async def run_act3(
    payload: Optional[Act3RunRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Trigger Act III: 'The City Adapts — Multi-Agent Swarm'.
    Coordinates the 5-agent workforce to resolve INC-002.
    Synthesizes multi-hazard action plan via Gemini 2.5 Flash and resolves incident.
    """
    from engines.act3 import Act3Orchestrator, get_act3_orchestrator

    sync_mode = payload.sync if payload else False
    delay_override = payload.delay if payload else None
    incident_id = payload.incident_id if payload else "INC-002"

    orchestrator = Act3Orchestrator(delay=delay_override) if delay_override is not None else get_act3_orchestrator()

    if sync_mode:
        result = await orchestrator.run(incident_id=incident_id, db=db)
        return {"status": "completed", **result}
    else:
        asyncio.create_task(orchestrator.run(incident_id=incident_id))
        return {
            "status": "started",
            "act": "III",
            "incident_id": incident_id,
            "message": f"Act III started in background. Stream events at /events/stream?incident_id={incident_id}",
        }

