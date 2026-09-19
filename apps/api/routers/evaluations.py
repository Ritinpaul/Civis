"""
CIVIS — Evaluations Router (Phase 10)
Endpoints for executing and inspecting specialist agent evaluations.
"""
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from models.agent import Agent
from models.evaluation import Evaluation
from engines.evaluation import EvaluationEngine, get_evaluation_engine
from engines.intelligence import IntelligenceEngine, get_intelligence_engine

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class EvaluationRunRequest(BaseModel):
    agent_id: str = Field(..., example="passage-agent", description="Agent ID to evaluate")
    incident_id: Optional[str] = Field(None, example="INC-002", description="Associated incident ID")
    run_number: int = Field(1, example=1, description="Evaluation run number (1=initial, 2=after repair)")
    repair_applied: bool = Field(False, example=False, description="Whether prompt repair has been applied")
    sync: bool = Field(True, description="Whether to wait synchronously for evaluation to complete")
    delay: Optional[float] = Field(None, description="Pacing delay in seconds between test events")


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/run", response_model=dict)
async def run_evaluation(
    payload: EvaluationRunRequest,
    db: Session = Depends(get_db),
    engine: EvaluationEngine = Depends(get_evaluation_engine),
):
    """
    Execute the 7-test evaluation suite (T01-T07) against a specialist agent.
    - Run 1 (initial): T03 fails (returns PASSABLE, expected UNKNOWN) -> agent status becomes 'failed'.
    - Run 2 (after repair): T03 passes -> agent status becomes 'verified'.
    """
    agent = db.query(Agent).filter(Agent.id == payload.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{payload.agent_id}' not found")

    if payload.delay is not None:
        engine = EvaluationEngine(delay=payload.delay)

    if payload.sync:
        result = await engine.evaluate_specialist(
            agent_id=payload.agent_id,
            db=db,
            incident_id=payload.incident_id,
            run_number=payload.run_number,
            repair_applied=payload.repair_applied,
        )
        return result
    else:
        asyncio.create_task(
            engine.evaluate_specialist(
                agent_id=payload.agent_id,
                db=db,
                incident_id=payload.incident_id,
                run_number=payload.run_number,
                repair_applied=payload.repair_applied,
            )
        )
        return {
            "status": "started",
            "agent_id": payload.agent_id,
            "run_number": payload.run_number,
            "message": f"Evaluation initiated for '{payload.agent_id}'. Stream events at /events/stream",
        }


@router.get("", response_model=List[dict])
def list_evaluations(
    agent_id: Optional[str] = Query(None, description="Filter by agent ID"),
    run_number: Optional[int] = Query(None, description="Filter by run number"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by test status (passed/failed)"),
    test_id: Optional[str] = Query(None, description="Filter by test ID (e.g. T03)"),
    db: Session = Depends(get_db),
):
    """List evaluation test records with optional filters."""
    query = db.query(Evaluation)
    if agent_id:
        query = query.filter(Evaluation.agent_id == agent_id)
    if run_number is not None:
        query = query.filter(Evaluation.run_number == run_number)
    if status_filter:
        query = query.filter(Evaluation.status == status_filter)
    if test_id:
        query = query.filter(Evaluation.test_id == test_id)

    evals = query.order_by(Evaluation.evaluated_at.asc()).all()
    return [e.to_dict() for e in evals]


@router.get("/test-cases/{agent_id}", response_model=dict)
async def get_agent_test_cases(
    agent_id: str,
    db: Session = Depends(get_db),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Generate or retrieve the 7 evaluation test cases for a specialist agent."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    suite = await intelligence.generate_evaluation_cases(agent.to_manifest())
    return suite.model_dump()


@router.get("/{agent_id}", response_model=dict)
def get_agent_evaluations(
    agent_id: str,
    db: Session = Depends(get_db),
):
    """Get full evaluation summary and historical test runs for a specialist agent."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    evals = db.query(Evaluation).filter(Evaluation.agent_id == agent_id).order_by(Evaluation.evaluated_at.asc()).all()
    runs = sorted(list({e.run_number for e in evals}))

    return {
        "agent_id": agent.id,
        "agent_name": agent.name,
        "authority_status": agent.authority_status,
        "total_evaluations": len(evals),
        "runs": runs,
        "evaluations": [e.to_dict() for e in evals],
    }
