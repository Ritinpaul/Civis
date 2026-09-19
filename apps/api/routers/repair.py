"""
CIVIS — Repair Router (Phase 11)
Endpoints for diagnosing agent failures, applying prompt repairs, and triggering re-evaluations.
"""
import asyncio
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from models.agent import Agent
from models.evaluation import Evaluation
from engines.repair import RepairEngine, get_repair_engine

router = APIRouter(prefix="/repair", tags=["Repair"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class RepairRunRequest(BaseModel):
    agent_id: str = Field(..., example="passage-agent", description="Agent ID to repair")
    incident_id: Optional[str] = Field(None, example="INC-002", description="Associated incident ID")
    failed_test_id: str = Field("T03", example="T03", description="Failed test ID to diagnose and fix")
    auto_reevaluate: bool = Field(True, description="Whether to automatically re-evaluate after repair")
    sync: bool = Field(True, description="Whether to wait synchronously for repair and re-evaluation to complete")
    delay: Optional[float] = Field(None, description="Pacing delay in seconds between events")


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("", response_model=dict)
async def run_repair(
    payload: RepairRunRequest,
    db: Session = Depends(get_db),
    engine: RepairEngine = Depends(get_repair_engine),
):
    """
    Diagnose a specialist failure (specifically T03) and apply safety-governed prompt repair.
    Transitions agent status: FAILED -> REPAIRING -> (EVALUATING) -> VERIFIED.
    """
    agent = db.query(Agent).filter(Agent.id == payload.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{payload.agent_id}' not found")

    if payload.delay is not None:
        engine = RepairEngine(delay=payload.delay)

    if payload.sync:
        result = await engine.repair_specialist(
            agent_id=payload.agent_id,
            db=db,
            incident_id=payload.incident_id,
            failed_test_id=payload.failed_test_id,
            auto_reevaluate=payload.auto_reevaluate,
        )
        return result
    else:
        asyncio.create_task(
            engine.repair_specialist(
                agent_id=payload.agent_id,
                db=db,
                incident_id=payload.incident_id,
                failed_test_id=payload.failed_test_id,
                auto_reevaluate=payload.auto_reevaluate,
            )
        )
        return {
            "status": "started",
            "agent_id": payload.agent_id,
            "failed_test_id": payload.failed_test_id,
            "message": f"Repair initiated for '{payload.agent_id}'. Stream events at /events/stream",
        }


@router.get("/history/{agent_id}", response_model=dict)
def get_repair_history(
    agent_id: str,
    db: Session = Depends(get_db),
):
    """Get failure diagnostics and evaluation history across runs for an agent."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    evals = db.query(Evaluation).filter(Evaluation.agent_id == agent_id).order_by(Evaluation.evaluated_at.asc()).all()

    run1 = [e.to_dict() for e in evals if e.run_number == 1]
    run2 = [e.to_dict() for e in evals if e.run_number == 2]

    return {
        "agent_id": agent.id,
        "agent_name": agent.name,
        "current_version": agent.version,
        "authority_status": agent.authority_status,
        "run1_evaluations": run1,
        "run2_evaluations": run2,
        "repaired": len(run2) > 0,
    }
