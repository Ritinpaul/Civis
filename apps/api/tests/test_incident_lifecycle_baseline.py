"""
CIVIS — Phase 6 Test Suite (Act I: The City Knows)
Verifies:
- Complete Act I 11-event lifecycle for INC-001
- Pacing and sequence of SSE events
- 4 base agents response (Weather, Infra, Traffic, Emergency)
- Swarm coordination and resolution
- Incident state updated to 'resolved' with resolved_at timestamp
- Provenance events persisted to DB
- Endpoints: POST /demo/act1, POST /incidents/act1, GET /incidents/INC-001/timeline
"""
import os
import sys
import pytest

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_p6.db"

from core.database import init_db, SessionLocal
from scripts.seed import seed
from models.incident import Incident
from models.provenance import ProvenanceEvent
from engines.act1 import Act1Orchestrator
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
    if os.path.exists("test_civis_p6.db"):
        try:
            os.remove("test_civis_p6.db")
        except Exception:
            pass


@pytest.mark.asyncio
async def test_act1_orchestrator_execution():
    """Verify Act1Orchestrator runs the full 11-event sequence for INC-001."""
    bus = EventBus()
    q = await bus.subscribe(incident_id="INC-001")

    # Run with delay=0 for instant testing
    orchestrator = Act1Orchestrator(bus=bus, delay=0.0)
    db = SessionLocal()
    try:
        result = await orchestrator.run(db=db)

        # Assert returned summary
        assert result["act"] == "I"
        assert result["incident_id"] == "INC-001"
        assert result["status"] == "resolved"
        assert result["event_count"] == 11
        assert len(result["agents_involved"]) == 4

        # Verify DB state of incident
        inc = db.query(Incident).filter(Incident.id == "INC-001").first()
        assert inc is not None
        assert inc.status == "resolved"
        assert inc.resolved_at is not None

        # Verify DB provenance events
        prov_events = (
            db.query(ProvenanceEvent)
            .filter(ProvenanceEvent.incident_id == "INC-001")
            .order_by(ProvenanceEvent.timestamp.asc())
            .all()
        )
        assert len(prov_events) >= 11

        # Collect events from SSE queue
        sse_events = []
        while not q.empty():
            sse_events.append(q.get_nowait())

        event_types = [e.get("event_type") for e in sse_events]
        expected_types = [
            "INCIDENT_RECEIVED",
            "GEMINI_UNDERSTANDING",
            "CAPABILITY_DECOMPOSITION",
            "CAPABILITY_FOUND",
            "WORKFORCE_ATTEMPTING",
            "AGENT_COMPLETED",  # weather
            "AGENT_COMPLETED",  # infra
            "AGENT_COMPLETED",  # traffic
            "AGENT_COMPLETED",  # emergency
            "SWARM_DISPATCHED",
            "INCIDENT_RESOLVED",
        ]

        assert event_types == expected_types, f"Mismatch in event sequence: {event_types}"

    finally:
        db.close()
        await bus.unsubscribe(q, incident_id="INC-001")


def test_act1_endpoints():
    """Verify HTTP endpoints for Act I."""
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # 1. POST /demo/act1 with sync=True and delay=0
    r = client.post("/demo/act1", json={"sync": True, "delay": 0.0})
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ["resolved", "completed"]
    assert data["incident_id"] == "INC-001"
    assert data["event_count"] == 11

    # 2. GET /incidents/INC-001
    r = client.get("/incidents/INC-001")
    assert r.status_code == 200
    inc_data = r.json()
    assert inc_data["status"] == "resolved"
    assert inc_data["resolved_at"] is not None

    # 3. GET /incidents/INC-001/timeline
    r = client.get("/incidents/INC-001/timeline")
    assert r.status_code == 200
    timeline = r.json()
    assert len(timeline) >= 11
    first_event = timeline[0]
    last_event = timeline[-1]
    assert first_event["event_type"] == "INCIDENT_RECEIVED"
    assert last_event["event_type"] == "INCIDENT_RESOLVED"

    # 4. POST /incidents/act1?sync=true
    r = client.post("/incidents/act1?sync=true")
    assert r.status_code == 200
    assert r.json()["status"] == "resolved"
