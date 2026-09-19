"""
CIVIS — Authority & Governance Router (Phase 12)
Endpoints for viewing the 2D Authority Matrix (Screen 5) and managing tool grants/denials.
"""
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from engines.governance import get_governance_engine, GovernanceEngine

logger = logging.getLogger("civis.authority")
router = APIRouter(prefix="/authority", tags=["Authority"])


class AuthorityGrantRequest(BaseModel):
    agent_id: str = Field(..., description="Agent ID to grant or deny authority for")
    tool_name: str = Field(..., description="Tool name (e.g. road.read)")
    reason: str = Field(default="Authorized by governance policy", description="Policy rationale")
    granted_by: str = Field(default="governance-engine", description="Entity issuing the grant")
    expires_at: Optional[datetime] = Field(None, description="Optional expiry timestamp")
    incident_id: Optional[str] = Field(None, description="Associated incident for provenance")


class AuthorityDenyRequest(BaseModel):
    agent_id: str = Field(..., description="Agent ID to deny authority for")
    tool_name: str = Field(..., description="Tool name to explicitly deny")
    reason: str = Field(default="Explicitly blocked by governance policy", description="Denial rationale")
    granted_by: str = Field(default="governance-engine", description="Entity issuing the denial")
    incident_id: Optional[str] = Field(None, description="Associated incident for provenance")


@router.get("/matrix", response_model=dict)
def get_authority_matrix(
    db: Session = Depends(get_db),
    engine: GovernanceEngine = Depends(get_governance_engine),
):
    """
    Get full 2D Allow/Deny Matrix for frontend Screen 5 (Authority Panel).
    Returns agents, canonical tools, and status matrix.
    """
    return engine.get_authority_matrix(db=db)


@router.get("/{agent_id}", response_model=List[dict])
def get_agent_authorities(
    agent_id: str,
    db: Session = Depends(get_db),
    engine: GovernanceEngine = Depends(get_governance_engine),
):
    """Get all explicit authority records for a specific agent."""
    return engine.get_agent_authorities(agent_id=agent_id, db=db)


@router.post("/grant", response_model=dict)
async def grant_authority(
    payload: AuthorityGrantRequest,
    db: Session = Depends(get_db),
    engine: GovernanceEngine = Depends(get_governance_engine),
):
    """Explicitly grant a tool permission to an agent."""
    return await engine.grant_authority(
        agent_id=payload.agent_id,
        tool_name=payload.tool_name,
        decision="allow",
        reason=payload.reason,
        granted_by=payload.granted_by,
        expires_at=payload.expires_at,
        incident_id=payload.incident_id,
        db=db,
    )


@router.post("/deny", response_model=dict)
async def deny_authority(
    payload: AuthorityDenyRequest,
    db: Session = Depends(get_db),
    engine: GovernanceEngine = Depends(get_governance_engine),
):
    """Explicitly deny a tool permission to an agent."""
    return await engine.deny_authority(
        agent_id=payload.agent_id,
        tool_name=payload.tool_name,
        reason=payload.reason,
        granted_by=payload.granted_by,
        incident_id=payload.incident_id,
        db=db,
    )


@router.delete("/{authority_id}", response_model=dict)
async def revoke_authority(
    authority_id: str,
    incident_id: Optional[str] = Query(None, description="Associated incident for provenance"),
    db: Session = Depends(get_db),
    engine: GovernanceEngine = Depends(get_governance_engine),
):
    """Revoke an authority record."""
    success = await engine.revoke_authority(authority_id=authority_id, incident_id=incident_id, db=db)
    if not success:
        raise HTTPException(status_code=404, detail=f"Authority record '{authority_id}' not found.")
    return {"status": "revoked", "authority_id": authority_id}


@router.post("/passage-agent/enforce", response_model=dict)
async def enforce_passage_agent_defaults(
    incident_id: Optional[str] = Query("INC-002", description="Incident ID"),
    db: Session = Depends(get_db),
    engine: GovernanceEngine = Depends(get_governance_engine),
):
    """
    Enforce canonical Phase 12 allow/deny permissions for passage-agent:
      - ALLOWED: road.read, weather.read, imagery.read
      - DENIED:  citizen.read, traffic.write, emergency.dispatch
    """
    return await engine.enforce_default_passage_agent_policies(
        agent_id="passage-agent",
        incident_id=incident_id,
        db=db,
    )
