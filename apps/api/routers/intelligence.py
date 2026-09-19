"""
CIVIS — Intelligence Router
Exposes the 7 Gemini intelligence jobs as endpoints for the frontend and demo engine:
  1. POST /intelligence/understand
  2. POST /intelligence/decompose
  3. POST /intelligence/specify
  4. POST /intelligence/generate-evals
  5. POST /intelligence/analyze-failure
  6. POST /intelligence/plan-repair
  7. POST /intelligence/coordinate-swarm
"""
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from models.capability import Capability
from models.incident import Incident
from services.event_bus import get_event_bus, EventBus
from engines.intelligence import (
    get_intelligence_engine,
    IntelligenceEngine,
    IncidentUnderstanding,
    CapabilityDecomposition,
    SpecialistSpecification,
    EvaluationSuite,
    FailureAnalysis,
    RepairPlan,
    SwarmCoordination,
)

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class UnderstandRequest(BaseModel):
    incident_id: Optional[str] = None
    incident: Optional[Dict[str, Any]] = None


class SpecifyRequest(BaseModel):
    missing_capability: str = Field(..., example="flood_passability")
    incident_id: Optional[str] = None
    incident: Optional[Dict[str, Any]] = None


class GenerateEvalsRequest(BaseModel):
    manifest: Dict[str, Any]


class AnalyzeFailureRequest(BaseModel):
    test_case: Dict[str, Any]
    actual_output: str = Field(default="PASSABLE")
    agent_reasoning: Optional[str] = ""
    incident_id: Optional[str] = None


class PlanRepairRequest(BaseModel):
    failure_analysis: Dict[str, Any]
    current_manifest: Dict[str, Any]
    incident_id: Optional[str] = None


class SwarmCoordinationRequest(BaseModel):
    incident: Dict[str, Any]
    agent_outputs: List[Dict[str, Any]]
    incident_id: Optional[str] = None


# ── Helper to resolve incident ────────────────────────────────────────────────
def _resolve_incident(db: Session, incident_id: Optional[str], incident_payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if incident_payload:
        return incident_payload
    if incident_id:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if inc:
            return inc.to_dict()
    raise HTTPException(status_code=400, detail="Must provide either incident_id or incident payload")


# ── Endpoints ─────────────────────────────────────────────────────────────────

# 1. Understand Incident
@router.post("/understand", response_model=dict)
async def understand_incident_endpoint(
    payload: UnderstandRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Job 1: Understand raw incident report using Gemini 2.5 Flash."""
    incident_data = _resolve_incident(db, payload.incident_id, payload.incident)
    understanding: IncidentUnderstanding = await intelligence.understand_incident(incident_data)

    await bus.publish_provenance(
        event_type="GEMINI_UNDERSTANDING",
        actor="gemini",
        message=f"Gemini analyzed incident: {understanding.summary}",
        payload=understanding.model_dump(),
        incident_id=payload.incident_id,
        db=db,
    )

    return understanding.model_dump()


# 2. Decompose Capabilities
@router.post("/decompose", response_model=dict)
async def decompose_capabilities_endpoint(
    payload: UnderstandRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Job 2: Decompose incident requirements against capability registry using Gemini 2.5 Flash."""
    incident_data = _resolve_incident(db, payload.incident_id, payload.incident)
    caps = db.query(Capability).filter(Capability.status == "verified").all()
    caps_dicts = [c.to_dict() for c in caps]

    decomposition: CapabilityDecomposition = await intelligence.decompose_capabilities(
        incident=incident_data,
        registered_capabilities=caps_dicts,
    )

    await bus.publish_provenance(
        event_type="CAPABILITY_DECOMPOSITION",
        actor="gemini",
        message=f"Capability decomposition complete. Gap detected: {decomposition.has_gap}",
        payload=decomposition.model_dump(),
        incident_id=payload.incident_id,
        db=db,
    )

    return decomposition.model_dump()


# 3. Specify Specialist
@router.post("/specify", response_model=dict)
async def specify_specialist_endpoint(
    payload: SpecifyRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Job 3: Design specialist AgentManifest using Gemini 2.5 Pro."""
    incident_data = _resolve_incident(db, payload.incident_id, payload.incident) if (payload.incident_id or payload.incident) else {}
    spec: SpecialistSpecification = await intelligence.specify_specialist(
        missing_capability=payload.missing_capability,
        incident=incident_data,
    )

    await bus.publish_provenance(
        event_type="SPECIALIST_SPECIFIED",
        actor="gemini",
        message=f"Gemini specified specialist agent '{spec.name}' ({spec.id}) for capability '{payload.missing_capability}'.",
        payload=spec.model_dump(),
        incident_id=payload.incident_id,
        db=db,
    )

    return spec.model_dump()


# 4. Generate Evaluation Cases
@router.post("/generate-evals", response_model=dict)
async def generate_evals_endpoint(
    payload: GenerateEvalsRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Job 4: Generate 7 evaluation cases (T01-T07) using Gemini 2.5 Flash."""
    suite: EvaluationSuite = await intelligence.generate_evaluation_cases(payload.manifest)

    await bus.publish_provenance(
        event_type="EVALUATION_STARTED",
        actor="gemini",
        message=f"Generated {len(suite.test_cases)} evaluation cases for agent '{suite.agent_id}'.",
        payload=suite.model_dump(),
        db=db,
    )

    return suite.model_dump()


# 5. Analyze Failure
@router.post("/analyze-failure", response_model=dict)
async def analyze_failure_endpoint(
    payload: AnalyzeFailureRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Job 5: Diagnose root cause of test failure (T03) using Gemini 2.5 Pro."""
    analysis: FailureAnalysis = await intelligence.analyze_failure(
        test_case=payload.test_case,
        actual_output=payload.actual_output,
        agent_reasoning=payload.agent_reasoning or "",
    )

    await bus.publish_provenance(
        event_type="REPAIR_INITIATED",
        actor="gemini",
        message=f"Root cause diagnosed for {analysis.test_id}: {analysis.failure_category}.",
        payload=analysis.model_dump(),
        incident_id=payload.incident_id,
        db=db,
    )

    return analysis.model_dump()


# 6. Plan Repair
@router.post("/plan-repair", response_model=dict)
async def plan_repair_endpoint(
    payload: PlanRepairRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Job 6: Repair agent system prompt using Gemini 2.5 Pro."""
    failure_analysis = FailureAnalysis(**payload.failure_analysis)
    repair: RepairPlan = await intelligence.plan_repair(
        analysis=failure_analysis,
        current_manifest=payload.current_manifest,
    )

    await bus.publish_provenance(
        event_type="REPAIR_PLAN_GENERATED",
        actor="gemini",
        message=f"Repair plan generated: updated {repair.agent_id} to v{repair.repaired_version}.",
        payload=repair.model_dump(),
        incident_id=payload.incident_id,
        db=db,
    )

    return repair.model_dump()


# 7. Coordinate Swarm
@router.post("/coordinate-swarm", response_model=dict)
async def coordinate_swarm_endpoint(
    payload: SwarmCoordinationRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
    intelligence: IntelligenceEngine = Depends(get_intelligence_engine),
):
    """Job 7: Synthesize 5 agent outputs into swarm action plan using Gemini 2.5 Flash."""
    swarm: SwarmCoordination = await intelligence.coordinate_swarm(
        incident=payload.incident,
        agent_outputs=payload.agent_outputs,
    )

    await bus.publish_provenance(
        event_type="SWARM_DISPATCHED",
        actor="gemini",
        message=f"Swarm coordinated across {len(swarm.execution_order)} agents for incident {swarm.incident_id}.",
        payload=swarm.model_dump(),
        incident_id=payload.incident_id,
        db=db,
    )

    return swarm.model_dump()
