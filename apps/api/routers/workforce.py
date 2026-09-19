"""
CIVIS — Workforce Router
Endpoints for querying and managing the city's AI workforce.
Provides workforce status, agent manifests, and point-in-time capability snapshots.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from models.agent import Agent
from models.capability import Capability
from models.workforce import WorkforceSnapshot
from services.event_bus import get_event_bus, EventBus
from agents.runtime import GenericAgentRuntime

router = APIRouter(prefix="/workforce", tags=["Workforce"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class SnapshotCreate(BaseModel):
    trigger: str = Field(..., example="CAPABILITY_PERSISTED")
    version: Optional[int] = None


class AgentExecuteRequest(BaseModel):
    task: dict = Field(..., description="Task input payload (e.g. incident context or test case)")
    incident_id: Optional[str] = Field(None, description="Optional incident ID for provenance")


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/current", response_model=dict)
def get_current_workforce(db: Session = Depends(get_db)):
    """
    Returns the current workforce state:
    - Active agents and their assigned capabilities
    - Current capabilities in the registry
    - Total counts
    - Latest workforce snapshot metadata
    """
    agents = db.query(Agent).filter(Agent.status == "active").order_by(Agent.created_at.asc()).all()
    capabilities = db.query(Capability).filter(Capability.status == "verified").order_by(Capability.created_at.asc()).all()
    latest_snapshot = db.query(WorkforceSnapshot).order_by(WorkforceSnapshot.version.desc()).first()

    return {
        "status": "operational",
        "total_agents": len(agents),
        "total_capabilities": len(capabilities),
        "agents": [a.to_dict() for a in agents],
        "capabilities": [c.to_dict() for c in capabilities],
        "latest_snapshot": latest_snapshot.to_dict() if latest_snapshot else None,
    }


@router.get("/agents", response_model=List[dict])
def list_agents(
    authority_status: Optional[str] = Query(None, alias="authority_status"),
    operational_status: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """List all agents in the workforce, optionally filtered by authority or operational status."""
    query = db.query(Agent)
    if authority_status:
        query = query.filter(Agent.authority_status == authority_status)
    if operational_status:
        query = query.filter(Agent.status == operational_status)
    agents = query.order_by(Agent.created_at.asc()).all()
    return [a.to_dict() for a in agents]


@router.get("/agents/{agent_id}", response_model=dict)
def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
):
    """Get full details of a specific agent including its runtime manifest."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    data = agent.to_dict()
    data["manifest"] = agent.to_manifest()
    return data


@router.post("/agents/{agent_id}/execute", response_model=dict)
async def execute_agent(
    agent_id: str,
    payload: AgentExecuteRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
):
    """
    Execute any agent in the workforce (including forged specialists) via GenericAgentRuntime.
    Enforces hard authority checks against DB authority records.
    """
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    runtime = GenericAgentRuntime.from_manifest(agent, db=db)
    result = await runtime.execute(
        input_data=payload.task,
        incident_id=payload.incident_id or payload.task.get("id"),
        bus=bus,
        db=db,
    )
    return result


@router.get("/snapshots", response_model=List[dict])
def list_snapshots(db: Session = Depends(get_db)):
    """List historical workforce snapshots demonstrating city intelligence growth."""
    snapshots = db.query(WorkforceSnapshot).order_by(WorkforceSnapshot.version.asc()).all()
    return [s.to_dict() for s in snapshots]


@router.post("/snapshots", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_snapshot(
    payload: SnapshotCreate,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
):
    """Capture a new point-in-time workforce snapshot."""
    agents = db.query(Agent).filter(Agent.status == "active").all()
    capabilities = db.query(Capability).filter(Capability.status == "verified").all()

    # Determine next version number
    latest = db.query(WorkforceSnapshot).order_by(WorkforceSnapshot.version.desc()).first()
    next_version = (latest.version + 1) if latest else 1
    if payload.version:
        next_version = payload.version

    snapshot = WorkforceSnapshot(
        agent_ids=[a.id for a in agents],
        capability_ids=[c.id for c in capabilities],
        version=next_version,
        trigger=payload.trigger,
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    # Publish WORKFORCE_SNAPSHOT event
    await bus.publish_provenance(
        event_type="WORKFORCE_SNAPSHOT",
        actor="civis-system",
        message=f"Workforce snapshot v{snapshot.version} captured: {len(agents)} agents, {len(capabilities)} capabilities.",
        payload=snapshot.to_dict(),
        db=db,
    )

    return snapshot.to_dict()
