"""
CIVIS — Swarm Router (Phase 13)
Endpoints for triggering the 5-agent swarm coordination and retrieving the React Flow graph.
"""
import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from engines.act3 import get_act3_orchestrator, Act3Orchestrator

logger = logging.getLogger("civis.swarm")
router = APIRouter(prefix="/swarm", tags=["Swarm"])


class SwarmExecuteRequest(BaseModel):
    incident_id: str = Field(default="INC-002", description="Incident ID to coordinate swarm for")
    sync: bool = Field(default=False, description="Whether to wait for completion before returning")
    delay: Optional[float] = Field(None, description="Pacing delay in seconds between events")


@router.get("/graph", response_model=dict)
def get_swarm_flow_graph(
    orchestrator: Act3Orchestrator = Depends(get_act3_orchestrator),
):
    """
    Get React Flow graph data (nodes & edges) for Screen 6.
    Represents the 5-agent workforce topology and data dependency pipelines.
    """
    return orchestrator.get_flow_graph()


@router.post("/execute", response_model=dict)
@router.post("/act3", response_model=dict)
async def execute_swarm(
    payload: Optional[SwarmExecuteRequest] = None,
    db: Session = Depends(get_db),
    orchestrator: Act3Orchestrator = Depends(get_act3_orchestrator),
):
    """
    Execute 5-agent swarm coordination for INC-002.
    Mobilizes Weather, Infrastructure, Passage (Specialist), Traffic, and Emergency agents.
    Synthesizes multi-hazard action plan via Gemini 2.5 Flash and resolves incident.
    """
    incident_id = payload.incident_id if payload else "INC-002"
    sync_mode = payload.sync if payload else False
    delay_override = payload.delay if payload else None

    if delay_override is not None:
        orchestrator = Act3Orchestrator(delay=delay_override)

    if sync_mode:
        result = await orchestrator.run(incident_id=incident_id, db=db)
        return {"status": "completed", **result}
    else:
        asyncio.create_task(orchestrator.run(incident_id=incident_id))
        return {
            "status": "started",
            "act": "III",
            "incident_id": incident_id,
            "message": f"5-agent swarm started for {incident_id}. Stream events at /events/stream?incident_id={incident_id}",
        }
