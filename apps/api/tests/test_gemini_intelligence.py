"""
CIVIS — Phase 4 & Phase 5 Test Suite
Verifies:
- Phase 4: All 7 Gemini Intelligence jobs:
    1. understand_incident (Act I known vs Act II unknown)
    2. decompose_capabilities (no gap vs gap detected)
    3. specify_specialist (Passage Agent manifest)
    4. generate_evaluation_cases (T01-T07 evaluation suite)
    5. analyze_failure (T03 root cause diagnostics)
    6. plan_repair (repaired manifest v1.1.0 with safety prompt)
    7. coordinate_swarm (5-agent multi-hazard action plan)
- Phase 5: Capability Registry:
    - Pre-seeded 4 base capabilities
    - Absence of flood_passability (Act II gap trigger)
    - Exact and fuzzy string matching
    - Registry status and tool coverage
    - POST /capabilities/decompose endpoint
- Intelligence HTTP Endpoints:
    - POST /intelligence/understand, /decompose, /specify, /generate-evals, /analyze-failure, /plan-repair, /coordinate-swarm
"""
import os
import sys
import pytest

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure SQLite for test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_p45.db"

from core.database import init_db, SessionLocal
from scripts.seed import seed
from models.capability import Capability
from engines.intelligence import (
    IntelligenceEngine,
    intelligence_engine,
    IncidentUnderstanding,
    CapabilityDecomposition,
    SpecialistSpecification,
    EvaluationSuite,
    FailureAnalysis,
    RepairPlan,
    SwarmCoordination,
)


def setup_module():
    """Seed test database with 4 base capabilities."""
    init_db()
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


def teardown_module():
    """Clean up test database file."""
    if os.path.exists("test_civis_p45.db"):
        try:
            os.remove("test_civis_p45.db")
        except Exception:
            pass


# ── Test 1: Job 1 — Understand Incident ─────────────────────────────────────
@pytest.mark.asyncio
async def test_job1_understand_incident():
    engine = IntelligenceEngine()

    # Act I — Known Incident
    act1_inc = {
        "id": "INC-001",
        "title": "Monsoon Waterlogging, Chennai Zone 4",
        "description": "Heavy rainfall causing localized flooding in Saidapet.",
        "location": "Zone 4, Chennai",
        "severity": "high",
        "incident_type": "known",
    }
    act1_res = await engine.understand_incident(act1_inc)
    assert isinstance(act1_res, IncidentUnderstanding)
    assert act1_res.domain in ["flood", "traffic", "multi-hazard"]
    assert act1_res.urgency in ["low", "medium", "high", "critical"]
    assert act1_res.is_known_pattern is True

    # Act II — Unknown Incident
    act2_inc = {
        "id": "INC-002",
        "title": "Unknown Road Accessibility Anomaly",
        "description": "Corridor depth passability unknown for emergency vehicles.",
        "location": "Saidapet Causeway, Zone 4",
        "severity": "critical",
        "incident_type": "unknown",
    }
    act2_res = await engine.understand_incident(act2_inc)
    assert isinstance(act2_res, IncidentUnderstanding)
    assert act2_res.is_known_pattern is False
    assert act2_res.urgency == "critical"


# ── Test 2: Job 2 — Decompose Capabilities ──────────────────────────────────
@pytest.mark.asyncio
async def test_job2_decompose_capabilities():
    engine = IntelligenceEngine()
    registered_caps = [
        {"id": "weather_assessment", "name": "Weather & Flood Risk Assessment", "purpose": "Assess weather"},
        {"id": "traffic_monitoring", "name": "Traffic & Road Status Monitoring", "purpose": "Monitor traffic"},
        {"id": "infrastructure_monitoring", "name": "City Infrastructure Monitoring", "purpose": "Monitor drainage"},
        {"id": "emergency_coordination", "name": "Emergency Response Coordination", "purpose": "Coordinate emergency"},
    ]

    # Act I: all capabilities present
    act1_inc = {"id": "INC-001", "title": "Monsoon Waterlogging", "incident_type": "known"}
    act1_decomp = await engine.decompose_capabilities(act1_inc, registered_caps)
    assert isinstance(act1_decomp, CapabilityDecomposition)
    assert act1_decomp.has_gap is False
    assert len(act1_decomp.missing_capabilities) == 0

    # Act II: flood_passability is MISSING
    act2_inc = {"id": "INC-002", "title": "Unknown Road Accessibility Anomaly", "incident_type": "unknown"}
    act2_decomp = await engine.decompose_capabilities(act2_inc, registered_caps)
    assert isinstance(act2_decomp, CapabilityDecomposition)
    assert act2_decomp.has_gap is True
    assert "flood_passability" in act2_decomp.missing_capabilities


# ── Test 3: Job 3 — Specify Specialist ──────────────────────────────────────
@pytest.mark.asyncio
async def test_job3_specify_specialist():
    engine = IntelligenceEngine()
    incident = {
        "id": "INC-002",
        "title": "Unknown Road Accessibility Anomaly",
        "location": "Saidapet Causeway, Zone 4",
    }
    spec = await engine.specify_specialist("flood_passability", incident)
    assert isinstance(spec, SpecialistSpecification)
    assert spec.id == "passage-agent"
    assert spec.name == "Passage Agent"
    assert "flood_passability" in spec.capability_ids
    assert "road.read" in spec.tools
    assert spec.authority_status == "untrusted"
    assert "is_passable" in spec.output_schema.get("properties", {})


# ── Test 4: Job 4 — Generate Evaluation Cases ───────────────────────────────
@pytest.mark.asyncio
async def test_job4_generate_evaluation_cases():
    engine = IntelligenceEngine()
    manifest = {
        "id": "passage-agent",
        "name": "Passage Agent",
        "capability_ids": ["flood_passability"],
    }
    suite = await engine.generate_evaluation_cases(manifest)
    assert isinstance(suite, EvaluationSuite)
    assert len(suite.test_cases) == 7
    test_ids = [tc.test_id for tc in suite.test_cases]
    assert test_ids == ["T01", "T02", "T03", "T04", "T05", "T06", "T07"]

    # Verify T03 specifically tests the ambiguous condition
    t03 = next(tc for tc in suite.test_cases if tc.test_id == "T03")
    assert t03.expected_output == "UNKNOWN"
    assert "ambiguous" in t03.test_name.lower() or "causeway" in t03.test_name.lower()


# ── Test 5: Job 5 — Analyze Failure ─────────────────────────────────────────
@pytest.mark.asyncio
async def test_job5_analyze_failure():
    engine = IntelligenceEngine()
    test_case = {
        "test_id": "T03",
        "test_name": "Ambiguous Flooded Causeway",
        "input_data": {"water_depth_cm": 68.0, "current_speed_kmh": 12.0},
        "expected_output": "UNKNOWN",
    }
    analysis = await engine.analyze_failure(
        test_case=test_case,
        actual_output="PASSABLE",
        agent_reasoning="Water depth is 68cm which is under the 70cm 4x4 threshold, so road is passable.",
    )
    assert isinstance(analysis, FailureAnalysis)
    assert analysis.test_id == "T03"
    assert analysis.failure_category == "overconfident_extrapolation"
    assert len(analysis.root_cause) > 0
    assert len(analysis.recommended_fix) > 0


# ── Test 6: Job 6 — Plan Repair ─────────────────────────────────────────────
@pytest.mark.asyncio
async def test_job6_plan_repair():
    engine = IntelligenceEngine()
    failure_analysis = FailureAnalysis(
        test_id="T03",
        failure_category="overconfident_extrapolation",
        root_cause="Prompt lacked ambiguous condition threshold.",
        flawed_instruction="Evaluate water depth against standard vehicle thresholds.",
        recommended_fix="Add rule: return UNKNOWN if depth is 60-75cm with rapid current.",
    )
    current_manifest = {
        "id": "passage-agent",
        "name": "Passage Agent",
        "version": "1.0.0",
        "system_prompt": "Evaluate water depth against standard vehicle thresholds.",
    }
    repair = await engine.plan_repair(failure_analysis, current_manifest)
    assert isinstance(repair, RepairPlan)
    assert repair.original_version == "1.0.0"
    assert repair.repaired_version == "1.1.0"
    assert "UNKNOWN" in repair.repaired_system_prompt
    assert len(repair.changes_made) > 0


# ── Test 7: Job 7 — Coordinate Swarm ─────────────────────────────────────────
@pytest.mark.asyncio
async def test_job7_coordinate_swarm():
    engine = IntelligenceEngine()
    incident = {
        "id": "INC-002",
        "title": "Unknown Road Accessibility Anomaly",
        "location": "Saidapet Causeway, Zone 4",
    }
    agent_outputs = [
        {"agent_id": "weather-agent", "output": {"rainfall_mm": 142.5, "flood_risk_level": "critical"}},
        {"agent_id": "infra-agent", "output": {"drainage_status": "overloaded", "capacity_percentage": 124.5}},
        {"agent_id": "passage-agent", "output": {"is_passable": False, "passability_status": "IMPASSABLE"}},
        {"agent_id": "traffic-agent", "output": {"congestion_level": "critical"}},
        {"agent_id": "emergency-agent", "output": {"response_recommendation": "Deploy ambulances"}},
    ]
    swarm = await engine.coordinate_swarm(incident, agent_outputs)
    assert isinstance(swarm, SwarmCoordination)
    assert len(swarm.execution_order) == 5
    assert "PassageAgent" in swarm.execution_order
    assert len(swarm.evacuation_routes) > 0
    assert len(swarm.traffic_diversions) > 0


# ── Test 8: Phase 5 — Capability Registry Endpoints ─────────────────────────
def test_capability_registry_phase5():
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # 1. Registry Status
    r = client.get("/capabilities/registry-status")
    assert r.status_code == 200
    status_data = r.json()
    assert status_data["total_capabilities"] >= 4
    assert status_data["verified_capabilities"] >= 4
    assert status_data["is_flood_passability_registered"] is False
    assert "road.read" in status_data["referenced_tools"]

    # 2. Exact Search (Found)
    r = client.post("/capabilities/search", json={"query": "traffic_monitoring"})
    assert r.status_code == 200
    data = r.json()
    assert data["found"] is True
    assert data["match_score"] == 1.0

    # 3. Fuzzy Search (Found)
    r = client.post("/capabilities/search", json={"query": "weather assess"})
    assert r.status_code == 200
    data = r.json()
    assert data["found"] is True
    assert data["match_score"] >= 0.6
    assert data["capability"]["id"] == "weather_assessment"

    # 4. Search Missing Capability (Gap Detected)
    r = client.post("/capabilities/search", json={"query": "flood_passability", "incident_id": "INC-002"})
    assert r.status_code == 200
    data = r.json()
    assert data["found"] is False
    assert data["gap_detected"] is True
    assert data["suggested_action"] == "TRIGGER_ADAPTATION_ENGINE"

    # 5. Decompose Endpoint
    r = client.post("/capabilities/decompose", json={
        "incident": {
            "id": "INC-002",
            "title": "Unknown Road Accessibility Anomaly",
            "incident_type": "unknown",
            "location": "Saidapet, Zone 4",
        }
    })
    assert r.status_code == 200
    decomp_data = r.json()
    assert decomp_data["has_gap"] is True
    assert "flood_passability" in decomp_data["missing_capabilities"]


# ── Test 9: Intelligence HTTP Endpoints ─────────────────────────────────────
def test_intelligence_endpoints():
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # 1. /intelligence/understand
    r = client.post("/intelligence/understand", json={
        "incident": {
            "title": "Monsoon Waterlogging",
            "location": "Zone 4",
            "incident_type": "known",
        }
    })
    assert r.status_code == 200
    assert "summary" in r.json()

    # 2. /intelligence/decompose
    r = client.post("/intelligence/decompose", json={
        "incident": {
            "title": "Unknown Road Anomaly",
            "incident_type": "unknown",
            "location": "Zone 4",
        }
    })
    assert r.status_code == 200
    assert r.json()["has_gap"] is True

    # 3. /intelligence/specify
    r = client.post("/intelligence/specify", json={
        "missing_capability": "flood_passability",
    })
    assert r.status_code == 200
    assert r.json()["id"] == "passage-agent"

    # 4. /intelligence/generate-evals
    r = client.post("/intelligence/generate-evals", json={
        "manifest": {"id": "passage-agent", "name": "Passage Agent"}
    })
    assert r.status_code == 200
    assert len(r.json()["test_cases"]) == 7

    # 5. /intelligence/analyze-failure
    r = client.post("/intelligence/analyze-failure", json={
        "test_case": {"test_id": "T03", "expected_output": "UNKNOWN"},
        "actual_output": "PASSABLE",
    })
    assert r.status_code == 200
    assert r.json()["test_id"] == "T03"

    # 6. /intelligence/plan-repair
    r = client.post("/intelligence/plan-repair", json={
        "failure_analysis": {
            "test_id": "T03",
            "failure_category": "overconfident_extrapolation",
            "root_cause": "Test cause",
            "flawed_instruction": "Test instruction",
            "recommended_fix": "Test fix",
        },
        "current_manifest": {"id": "passage-agent", "version": "1.0.0"},
    })
    assert r.status_code == 200
    assert r.json()["repaired_version"] == "1.1.0"

    # 7. /intelligence/coordinate-swarm
    r = client.post("/intelligence/coordinate-swarm", json={
        "incident": {"id": "INC-002", "title": "Test Incident"},
        "agent_outputs": [{"agent_id": "weather-agent", "output": {}}],
    })
    assert r.status_code == 200
    assert len(r.json()["execution_order"]) == 5
