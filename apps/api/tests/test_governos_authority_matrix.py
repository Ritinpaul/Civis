"""
CIVIS — Phase 12 & Phase 13 Test Suite
Tests:
  - Phase 12: Governance & Authority Engine, hard enforcement in GenericAgentRuntime,
              Allow/Deny Matrix, and Authority REST API.
  - Phase 13: Multi-Agent Swarm (Act III), 5-agent execution order (Weather -> Infra -> Passage -> Traffic -> Emergency),
              Gemini 2.5 Flash swarm coordination, React Flow graph, and Swarm / Demo REST API.
"""
import os
import sys
import pytest
from datetime import datetime

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_phase12_13.db"

from fastapi.testclient import TestClient
from core.database import SessionLocal, init_db, engine, Base
from models import Agent, Capability, Authority, Incident, ProvenanceEvent, WorkforceSnapshot
from scripts.seed import seed
from agents.runtime import GenericAgentRuntime
from agents.workforce_manager import get_workforce_manager
from engines.governance import GovernanceEngine, CANONICAL_TOOLS, PASSAGE_AGENT_ALLOWED, PASSAGE_AGENT_DENIED
from engines.act3 import Act3Orchestrator
from main import app


@pytest.fixture(scope="module")
def setup_database():
    """Create clean database schema and seed initial data."""
    init_db()
    db = SessionLocal()
    try:
        # Clear existing tables
        db.query(ProvenanceEvent).delete()
        db.query(Authority).delete()
        db.query(Incident).delete()
        db.query(Agent).delete()
        db.query(Capability).delete()
        db.query(WorkforceSnapshot).delete()
        db.commit()

        # Seed initial capabilities and agents
        seed(db)

        # Seed passage-agent in verified status
        passage = Agent(
            id="passage-agent",
            name="Passage Agent",
            version="1.1.0",
            purpose="Assess dynamic road flood passability",
            capability_ids=["flood_passability"],
            tools=["road.read", "weather.read", "imagery.read"],
            system_prompt=(
                "You are the Passage Agent for Chennai's emergency corridor assessment. "
                "Assess road passability based on water depth, flow speed, and vehicle clearance. "
                "Output JSON with is_passable, passability_status (PASSABLE/IMPASSABLE/UNKNOWN), "
                "water_depth_cm, flow_velocity_ms, and route_recommendation."
            ),
            output_schema={
                "type": "object",
                "properties": {
                    "is_passable": {"type": "boolean"},
                    "passability_status": {"type": "string"},
                    "water_depth_cm": {"type": "number"},
                    "flow_velocity_ms": {"type": "number"},
                    "route_recommendation": {"type": "string"},
                },
                "required": ["is_passable", "passability_status", "water_depth_cm", "flow_velocity_ms"],
            },
            authority_status="verified",
            status="active",
            created_by="civis-forge",
        )
        db.add(passage)
        db.commit()
    finally:
        db.close()
    yield
    # Cleanup after module
    db = SessionLocal()
    try:
        db.query(ProvenanceEvent).delete()
        db.query(Authority).delete()
        db.query(Incident).delete()
        db.query(Agent).delete()
        db.query(Capability).delete()
        db.query(WorkforceSnapshot).delete()
        db.commit()
    finally:
        db.close()


# ── Test 1: Phase 12 Governance Authority Enforcement ─────────────────────────
@pytest.mark.asyncio
async def test_governance_authority_enforcement(setup_database):
    db = SessionLocal()
    try:
        gov = GovernanceEngine()

        # 1. Enforce default Phase 12 policies for passage-agent
        enforce_res = await gov.enforce_default_passage_agent_policies(
            agent_id="passage-agent",
            incident_id="INC-002",
            db=db,
        )
        assert enforce_res["authority_status"] == "authorized"
        assert set(enforce_res["allowed_tools"]) == set(PASSAGE_AGENT_ALLOWED)
        assert set(enforce_res["denied_tools"]) == set(PASSAGE_AGENT_DENIED)

        # Verify DB records
        auth_records = db.query(Authority).filter(Authority.agent_id == "passage-agent").all()
        allowed_db = [a.tool_name for a in auth_records if a.decision == "allow"]
        denied_db = [a.tool_name for a in auth_records if a.decision == "deny"]
        assert set(allowed_db) == set(PASSAGE_AGENT_ALLOWED)
        assert set(denied_db) == set(PASSAGE_AGENT_DENIED)

        # 2. Hard Enforcement in GenericAgentRuntime
        agent_model = db.query(Agent).filter(Agent.id == "passage-agent").first()
        runtime = GenericAgentRuntime.from_manifest(agent_model, db=db)

        # Test allowed tools pass authority check
        for t in PASSAGE_AGENT_ALLOWED:
            is_auth, reason = runtime.check_tool_authority(t, db=db)
            assert is_auth is True
            assert "allow" in reason.lower() or "explicit" in reason.lower() or "authorized" in reason.lower()

        # Test denied tools fail authority check
        for t in PASSAGE_AGENT_DENIED:
            is_auth, reason = runtime.check_tool_authority(t, db=db)
            assert is_auth is False
            assert "denied" in reason.lower()

        # Test unauthorized attempt emits UNAUTHORIZED_TOOL_DENIED event
        runtime_with_denied = GenericAgentRuntime(
            agent_id="passage-agent",
            name="Passage Agent",
            version="1.1.0",
            purpose="Testing denied tools",
            capability_ids=["flood_passability"],
            tools=["road.read", "citizen.read", "traffic.write"],
            system_prompt="Test",
            output_schema={},
            authority_status="authorized",
            allowed_tools=["road.read"],
        )
        exec_res = await runtime_with_denied.execute(
            input_data={"test": "data"},
            incident_id="INC-002",
            bus=gov.bus,
            db=db,
        )
        assert "denied_tools" in exec_res
        denied_names = [d["tool"] for d in exec_res["denied_tools"]]
        assert "citizen.read" in denied_names
        assert "traffic.write" in denied_names

        # Verify UNAUTHORIZED_TOOL_DENIED provenance event
        denied_event = (
            db.query(ProvenanceEvent)
            .filter(
                ProvenanceEvent.event_type == "UNAUTHORIZED_TOOL_DENIED",
                ProvenanceEvent.actor == "passage-agent",
            )
            .first()
        )
        assert denied_event is not None

        # 3. 2D Authority Matrix
        matrix_data = gov.get_authority_matrix(db=db)
        assert "agents" in matrix_data
        assert "tools" in matrix_data
        assert "matrix" in matrix_data
        assert "passage-agent" in matrix_data["matrix"]
        assert matrix_data["matrix"]["passage-agent"]["road.read"]["decision"] == "allow"
        assert matrix_data["matrix"]["passage-agent"]["citizen.read"]["decision"] == "deny"

    finally:
        db.close()


# ── Test 2: Phase 12 Authority HTTP Endpoints ─────────────────────────────────
def test_authority_http_endpoints(setup_database):
    client = TestClient(app)

    # 1. GET /authority/matrix
    res_mat = client.get("/authority/matrix")
    assert res_mat.status_code == 200
    mat = res_mat.json()
    assert "agents" in mat
    assert "tools" in mat
    assert "matrix" in mat

    # 2. GET /authority/{agent_id}
    res_agent = client.get("/authority/passage-agent")
    assert res_agent.status_code == 200
    records = res_agent.json()
    assert len(records) >= 6

    # 3. POST /authority/grant
    res_grant = client.post(
        "/authority/grant",
        json={
            "agent_id": "passage-agent",
            "tool_name": "imagery.read",
            "reason": "Explicit test grant",
        },
    )
    assert res_grant.status_code == 200
    assert res_grant.json()["decision"] == "allow"

    # 4. POST /authority/deny
    res_deny = client.post(
        "/authority/deny",
        json={
            "agent_id": "passage-agent",
            "tool_name": "emergency.dispatch",
            "reason": "Explicit test deny",
        },
    )
    assert res_deny.status_code == 200
    assert res_deny.json()["decision"] == "deny"

    # 5. POST /authority/passage-agent/enforce
    res_enforce = client.post("/authority/passage-agent/enforce")
    assert res_enforce.status_code == 200
    assert res_enforce.json()["authority_status"] == "authorized"


# ── Test 3: Phase 13 Act III Swarm Orchestration ─────────────────────────────
@pytest.mark.asyncio
async def test_act3_swarm_orchestration(setup_database):
    db = SessionLocal()
    try:
        orchestrator = Act3Orchestrator(delay=0.0)

        # 1. Run Act III
        result = await orchestrator.run(incident_id="INC-002", db=db)

        assert result["act"] == "III"
        assert result["incident_id"] == "INC-002"
        assert result["status"] == "resolved"
        assert len(result["agents_involved"]) == 5
        assert result["event_count"] >= 8

        # Invariant: 5 agents in execution order
        swarm_coord = result["swarm_coordination"]
        assert "execution_order" in swarm_coord
        assert len(swarm_coord["execution_order"]) == 5

        # Invariant: Incident resolved in DB
        inc = db.query(Incident).filter(Incident.id == "INC-002").first()
        assert inc is not None
        assert inc.status == "resolved"
        assert inc.resolved_at is not None

        # Invariant: Full provenance trail emitted
        events = (
            db.query(ProvenanceEvent)
            .filter(ProvenanceEvent.incident_id == "INC-002")
            .order_by(ProvenanceEvent.timestamp.asc())
            .all()
        )
        event_types = [e.event_type for e in events]
        assert "SWARM_STARTED" in event_types
        assert "SWARM_COORDINATED" in event_types
        assert "INCIDENT_RESOLVED" in event_types

        # 2. React Flow Graph
        graph = orchestrator.get_flow_graph()
        assert "nodes" in graph
        assert "edges" in graph
        assert len(graph["nodes"]) == 5
        assert len(graph["edges"]) == 5

        # Check specialist node
        specialist_node = next(n for n in graph["nodes"] if n["id"] == "passage-agent")
        assert specialist_node["data"]["isSpecialist"] is True
        assert specialist_node["data"]["capability"] == "flood_passability"
        assert specialist_node["data"]["allowedTools"] == ["road.read", "weather.read", "imagery.read"]

    finally:
        db.close()


# ── Test 4: Phase 13 Swarm & Demo HTTP Endpoints ──────────────────────────────
def test_swarm_and_demo_http_endpoints(setup_database):
    client = TestClient(app)

    # 1. GET /swarm/graph
    res_graph = client.get("/swarm/graph")
    assert res_graph.status_code == 200
    graph = res_graph.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) == 5

    # 2. POST /swarm/act3 (sync mode)
    res_swarm = client.post(
        "/swarm/act3",
        json={"incident_id": "INC-002", "sync": True, "delay": 0.0},
    )
    assert res_swarm.status_code == 200
    swarm_data = res_swarm.json()
    assert swarm_data["status"] in ("completed", "resolved")
    assert swarm_data["incident_id"] == "INC-002"

    # 3. POST /demo/act3 (sync mode)
    res_demo = client.post(
        "/demo/act3",
        json={"incident_id": "INC-002", "sync": True, "delay": 0.0},
    )
    assert res_demo.status_code == 200
    demo_data = res_demo.json()
    assert demo_data["status"] in ("completed", "resolved")
    assert demo_data["incident_id"] == "INC-002"
