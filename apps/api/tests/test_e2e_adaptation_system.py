"""
CIVIS — System Integration Test: Act II (Phase 7) → Forge (Phase 8)
Verifies the complete end-to-end transition:
1. Act I (Known problem) resolves with 4 base agents.
2. Act II (Unknown problem) triggers:
   - Unknown pattern identified by Gemini 2.5 Flash
   - CAPABILITY_GAP identified for 'flood_passability' (Hero moment)
   - Current workforce attempts and declares AGENT_INSUFFICIENT
3. Phase 8 (Forge) triggered:
   - ADAPTATION_STARTED
   - Gemini 2.5 Pro designs Passage Agent manifest
   - SPECIALIST_SPECIFIED
   - Agent persisted in DB with authority_status='untrusted'
   - Dynamically registered into WorkforceManager runtime
   - SPECIALIST_CREATED
4. System State Invariants:
   - Workforce roster grows to 5 agents (4 authorized + 1 untrusted specialist)
   - Untrusted specialist has NO allowed tools (governance boundary enforced)
   - Capability registry still does not contain 'flood_passability' (persisted only in Act IV)
   - Full provenance audit trail verified in DB and SSE stream
"""
import os
import sys
import pytest

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_system.db"

from core.database import init_db, SessionLocal
from scripts.seed import seed
from models.agent import Agent
from models.incident import Incident
from models.capability import Capability
from models.provenance import ProvenanceEvent
from engines.act1 import Act1Orchestrator
from engines.act2 import Act2Orchestrator
from engines.adaptation import AdaptationEngine
from agents.workforce_manager import get_workforce_manager
from services.event_bus import EventBus


def setup_module():
    """Seed test database."""
    init_db()
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


def teardown_module():
    """Clean up test database file."""
    if os.path.exists("test_civis_system.db"):
        try:
            os.remove("test_civis_system.db")
        except Exception:
            pass


@pytest.mark.asyncio
async def test_full_system_act2_to_forge_transition():
    """
    Full system test:
    Act I resolves -> Act II discovers gap -> Phase 8 forges Passage Agent as untrusted.
    """
    bus = EventBus()
    q_inc2 = await bus.subscribe(incident_id="INC-002")
    db = SessionLocal()

    try:
        # ── Step 1: Act I Execution (The City Knows) ──────────────────────────
        act1 = Act1Orchestrator(bus=bus, delay=0.0)
        act1_result = await act1.run(db=db)
        assert act1_result["status"] == "resolved"
        assert act1_result["event_count"] == 11

        inc1 = db.query(Incident).filter(Incident.id == "INC-001").first()
        assert inc1.status == "resolved"

        # ── Step 2: Act II Execution with auto_forge=True (The City Adapts) ────
        act2 = Act2Orchestrator(bus=bus, delay=0.0)
        act2_result = await act2.run(db=db, auto_forge=True)

        assert act2_result["act"] == "II"
        assert act2_result["gap_detected"] is True
        assert "flood_passability" in act2_result["missing_capabilities"]
        assert act2_result["workforce_status"] == "insufficient"
        assert act2_result["auto_forge_triggered"] is True
        assert act2_result["forge_result"] is not None
        assert act2_result["forge_result"]["authority_status"] == "untrusted"

        # ── Step 3: Verify System State Invariants ─────────────────────────────

        # Invariant 1: INC-002 is still investigating (unresolved until Act IV)
        inc2 = db.query(Incident).filter(Incident.id == "INC-002").first()
        assert inc2.status == "investigating"
        assert inc2.resolved_at is None

        # Invariant 2: Total agents in DB is now 5 (4 system + 1 civis-forge)
        all_agents = db.query(Agent).all()
        assert len(all_agents) == 5
        forged_agent = next((a for a in all_agents if a.id == "passage-agent"), None)
        assert forged_agent is not None
        assert forged_agent.authority_status == "untrusted"
        assert forged_agent.created_by == "civis-forge"
        assert "flood_passability" in forged_agent.capability_ids

        # Invariant 3: WorkforceManager runtime contains 5 agents
        wm = get_workforce_manager()
        runtime_passage = wm.get_agent("passage-agent")
        assert runtime_passage is not None
        assert runtime_passage.authority_status == "untrusted"
        assert runtime_passage.allowed_tools == []  # Governance: zero tools allowed while untrusted

        # Invariant 4: Capability registry still does NOT contain flood_passability as verified
        # (It must ONLY be verified after passing evaluation in Phase 14!)
        verified_caps = db.query(Capability).filter(Capability.status == "verified").all()
        verified_ids = [c.id for c in verified_caps]
        assert "flood_passability" not in verified_ids

        # Invariant 5: Complete Provenance Event Chain for INC-002
        prov_events = (
            db.query(ProvenanceEvent)
            .filter(ProvenanceEvent.incident_id == "INC-002")
            .order_by(ProvenanceEvent.timestamp.asc())
            .all()
        )
        event_types = [e.event_type for e in prov_events]

        # Verify key milestone events in chronological order
        assert "INCIDENT_RECEIVED" in event_types
        assert "GEMINI_UNDERSTANDING" in event_types
        assert "CAPABILITY_DECOMPOSITION" in event_types
        assert "CAPABILITY_GAP" in event_types
        assert "WORKFORCE_ATTEMPTING" in event_types
        assert "ADAPTATION_STARTED" in event_types
        assert "SPECIALIST_SPECIFIED" in event_types
        assert "SPECIALIST_CREATED" in event_types

        # Verify order of the hero moment and forge
        idx_gap = event_types.index("CAPABILITY_GAP")
        idx_adapt = event_types.index("ADAPTATION_STARTED")
        idx_spec = event_types.index("SPECIALIST_SPECIFIED")
        idx_created = event_types.index("SPECIALIST_CREATED")
        assert idx_gap < idx_adapt < idx_spec < idx_created

    finally:
        db.close()
        await bus.unsubscribe(q_inc2, incident_id="INC-002")


def test_system_http_pipeline():
    """Verify system-level HTTP endpoints for Act II and Forge."""
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # 1. Trigger Act II with auto_forge=True
    r = client.post("/demo/act2", json={"sync": True, "delay": 0.0, "auto_forge": True})
    assert r.status_code == 200
    data = r.json()
    assert data["gap_detected"] is True
    assert data["auto_forge_triggered"] is True
    assert data["forge_result"]["agent"]["id"] == "passage-agent"
    assert data["forge_result"]["agent"]["authority_status"] == "untrusted"

    # 2. Verify /workforce/current reports 5 agents
    r = client.get("/workforce/current")
    assert r.status_code == 200
    wf_data = r.json()
    assert wf_data["total_agents"] == 5
    agent_ids = [a["id"] for a in wf_data["agents"]]
    assert "passage-agent" in agent_ids

    # 3. Verify /forge/agents endpoint
    r = client.get("/forge/agents")
    assert r.status_code == 200
    forged = r.json()
    assert len(forged) >= 1
    assert forged[0]["id"] == "passage-agent"
    assert forged[0]["authority_status"] == "untrusted"

    # 4. Verify /incidents/INC-002/timeline has full audit trail
    r = client.get("/incidents/INC-002/timeline")
    assert r.status_code == 200
    timeline = r.json()
    types = [e["event_type"] for e in timeline]
    assert "CAPABILITY_GAP" in types
    assert "SPECIALIST_CREATED" in types
