"""
CIVIS — Forge Router
Endpoints for triggering the CIVIS Adaptation Engine (Forge):
  - POST /forge: Forge a specialist agent for a missing capability
  - GET  /forge/agents: List all agents created by CIVIS Forge
  - GET  /forge/agents/{agent_id}: Get forged agent details and manifest
"""
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from models.agent import Agent
from engines.adaptation import get_adaptation_engine, AdaptationEngine

router = APIRouter(prefix="/forge", tags=["Forge"])


class ForgeRequest(BaseModel):
    missing_capability: str = Field(default="flood_passability", example="flood_passability")
    incident_id: Optional[str] = Field(default="INC-002", example="INC-002")
    incident: Optional[Dict[str, Any]] = None


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def forge_specialist_endpoint(
    payload: Optional[ForgeRequest] = None,
    db: Session = Depends(get_db),
    engine: AdaptationEngine = Depends(get_adaptation_engine),
):
    """
    Forge a new specialist agent in response to a capability gap.
    Uses Gemini 2.5 Pro to design the manifest, creates the agent with status='untrusted',
    and registers it into the workforce runtime.
    """
    missing_cap = payload.missing_capability if payload else "flood_passability"
    inc_id = payload.incident_id if payload else "INC-002"
    inc_data = payload.incident if payload else None

    result = await engine.forge_specialist(
        missing_capability=missing_cap,
        incident_id=inc_id,
        incident=inc_data,
        db=db,
    )
    return result


@router.get("/agents", response_model=List[dict])
def list_forged_agents(db: Session = Depends(get_db)):
    """List all agents created by CIVIS Forge."""
    agents = db.query(Agent).filter(Agent.created_by == "civis-forge").all()
    return [a.to_dict() for a in agents]


@router.get("/agents/{agent_id}", response_model=dict)
def get_forged_agent(agent_id: str, db: Session = Depends(get_db)):
    """Get details of a specific forged agent."""
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.created_by == "civis-forge").first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Forged agent '{agent_id}' not found")
    data = agent.to_dict()
    data["manifest"] = agent.to_manifest()
    return data
