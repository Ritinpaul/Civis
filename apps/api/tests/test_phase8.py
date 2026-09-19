"""
CIVIS — Phase 8 Test Suite (Adaptation Engine / Forge)
Verifies:
- AdaptationEngine.forge_specialist execution pipeline:
    1. ADAPTATION_STARTED event
    2. Gemini 2.5 Pro specialist specification
    3. SPECIALIST_SPECIFIED event
    4. Database Agent record with authority_status='untrusted' and created_by='civis-forge'
    5. Registration into WorkforceManager runtime (dynamic JSON manifest execution)
    6. SPECIALIST_CREATED event
- Idempotent re-forging for demo repeatability
- HTTP Endpoints:
    - POST /forge
    - GET  /forge/agents
    - GET  /forge/agents/{agent_id}
"""
import os
import sys
import pytest

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_p8.db"

from core.database import init_db, SessionLocal
from scripts.seed import seed
from models.agent import Agent
from models.provenance import ProvenanceEvent
from engines.adaptation import AdaptationEngine
from services.event_bus import EventBus
from agents.workforce_manager import get_workforce_manager


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
    if os.path.exists("test_civis_p8.db"):
        try:
            os.remove("test_civis_p8.db")
        except Exception:
            pass


@pytest.mark.asyncio
async def test_forge_specialist_pipeline():
    """Verify that AdaptationEngine forges Passage Agent with authority_status='untrusted'."""
    bus = EventBus()
    q = await bus.subscribe(incident_id="INC-002")

    engine = AdaptationEngine(bus=bus)
    db = SessionLocal()

    try:
        result = await engine.forge_specialist(
            missing_capability="flood_passability",
            incident_id="INC-002",
            db=db,
        )

        # 1. Assert returned result
        assert result["status"] == "created"
        assert result["authority_status"] == "untrusted"
        assert result["created_by"] == "civis-forge"
        assert result["missing_capability"] == "flood_passability"
        assert result["agent"]["id"] == "passage-agent"
        assert result["agent"]["name"] == "Passage Agent"
        assert "flood_passability" in result["agent"]["capability_ids"]

        # 2. Verify Database State
        agent = db.query(Agent).filter(Agent.id == "passage-agent").first()
        assert agent is not None
        assert agent.authority_status == "untrusted"
        assert agent.created_by == "civis-forge"
        assert "road.read" in agent.tools
        assert "weather.read" in agent.tools
        assert "imagery.read" in agent.tools

        # 3. Verify WorkforceManager Runtime Registration
        wm = get_workforce_manager()
        runtime_agent = wm.get_agent("passage-agent")
        assert runtime_agent is not None
        assert runtime_agent.authority_status == "untrusted"
        assert runtime_agent.allowed_tools == []  # Untrusted has NO allowed tools

        # 4. Verify Emitted Provenance Events
        events = []
        while not q.empty():
            events.append(q.get_nowait())

        event_types = [e.get("event_type") for e in events]
        assert "ADAPTATION_STARTED" in event_types
        assert "SPECIALIST_SPECIFIED" in event_types
        assert "SPECIALIST_CREATED" in event_types

        # Verify event order
        idx_started = event_types.index("ADAPTATION_STARTED")
        idx_spec = event_types.index("SPECIALIST_SPECIFIED")
        idx_created = event_types.index("SPECIALIST_CREATED")
        assert idx_started < idx_spec < idx_created

    finally:
        db.close()
        await bus.unsubscribe(q, incident_id="INC-002")


def test_forge_http_endpoints():
    """Verify HTTP endpoints for Phase 8 Forge."""
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # 1. POST /forge
    r = client.post("/forge", json={
        "missing_capability": "flood_passability",
        "incident_id": "INC-002",
    })
    assert r.status_code == 201
    data = r.json()
    assert data["status"] == "created"
    assert data["authority_status"] == "untrusted"
    assert data["agent"]["id"] == "passage-agent"
    assert "manifest" in data

    # 2. GET /forge/agents
    r = client.get("/forge/agents")
    assert r.status_code == 200
    forged_list = r.json()
    assert len(forged_list) >= 1
    assert any(a["id"] == "passage-agent" for a in forged_list)

    # 3. GET /forge/agents/passage-agent
    r = client.get("/forge/agents/passage-agent")
    assert r.status_code == 200
    agent_data = r.json()
    assert agent_data["id"] == "passage-agent"
    assert agent_data["authority_status"] == "untrusted"
    assert "manifest" in agent_data
    assert agent_data["manifest"]["output_schema"] is not None

    # 4. Verify /workforce/agents includes the forged agent
    r = client.get("/workforce/agents/passage-agent")
    assert r.status_code == 200
    assert r.json()["authority_status"] == "untrusted"
