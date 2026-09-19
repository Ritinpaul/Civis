"""
CIVIS — Phase 7 Test Suite (Act II: The City Doesn't Know)
Verifies:
- Complete Act II lifecycle for INC-002 (Unknown Road Accessibility Anomaly)
- Detection of unknown hazard pattern by Gemini 2.5 Flash
- Identification of CAPABILITY_GAP ('flood_passability') — the hero moment
- Existing 4-agent workforce attempt and declaration of AGENT_INSUFFICIENT
- Incident state remains 'investigating' (unresolved, awaiting adaptation)
- Provenance events stored in DB
- Endpoints: POST /demo/act2, POST /incidents/act2, GET /incidents/INC-002/timeline
"""
import os
import sys
import pytest

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_p7.db"

from core.database import init_db, SessionLocal
from scripts.seed import seed
from models.incident import Incident
from models.provenance import ProvenanceEvent
from engines.act2 import Act2Orchestrator
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
    if os.path.exists("test_civis_p7.db"):
        try:
            os.remove("test_civis_p7.db")
        except Exception:
            pass


@pytest.mark.asyncio
async def test_act2_orchestrator_execution():
    """Verify Act2Orchestrator runs the Act II sequence: gap identified and workforce insufficient."""
    bus = EventBus()
    q = await bus.subscribe(incident_id="INC-002")

    orchestrator = Act2Orchestrator(bus=bus, delay=0.0)
    db = SessionLocal()

    try:
        result = await orchestrator.run(db=db, auto_forge=False)

        # 1. Assert returned result
        assert result["act"] == "II"
        assert result["incident_id"] == "INC-002"
        assert result["status"] == "capability_gap_detected"
        assert result["gap_detected"] is True
        assert "flood_passability" in result["missing_capabilities"]
        assert result["workforce_status"] == "insufficient"

        # 2. Verify Database State
        inc = db.query(Incident).filter(Incident.id == "INC-002").first()
        assert inc is not None
        assert inc.incident_type == "unknown"
        assert inc.status == "investigating"
        assert inc.resolved_at is None  # Unresolved — requires adaptation

        # 3. Verify Provenance Events in DB
        prov_events = (
            db.query(ProvenanceEvent)
            .filter(ProvenanceEvent.incident_id == "INC-002")
            .order_by(ProvenanceEvent.timestamp.asc())
            .all()
        )
        assert len(prov_events) >= 5
        event_types_db = [e.event_type for e in prov_events]
        assert "INCIDENT_RECEIVED" in event_types_db
        assert "GEMINI_UNDERSTANDING" in event_types_db
        assert "CAPABILITY_DECOMPOSITION" in event_types_db
        assert "CAPABILITY_GAP" in event_types_db
        assert "WORKFORCE_ATTEMPTING" in event_types_db

        # 4. Verify SSE Stream Events
        sse_events = []
        while not q.empty():
            sse_events.append(q.get_nowait())

        event_types = [e.get("event_type") for e in sse_events]
        assert "INCIDENT_RECEIVED" in event_types
        assert "CAPABILITY_GAP" in event_types
        assert "WORKFORCE_ATTEMPTING" in event_types
        assert "AGENT_INSUFFICIENT" in event_types

    finally:
        db.close()
        await bus.unsubscribe(q, incident_id="INC-002")


def test_act2_endpoints():
    """Verify HTTP endpoints for Act II."""
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # 1. POST /demo/act2 with sync=True and delay=0
    r = client.post("/demo/act2", json={"sync": True, "delay": 0.0, "auto_forge": False})
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ["completed", "capability_gap_detected"]
    assert data["incident_id"] == "INC-002"
    assert data["gap_detected"] is True
    assert "flood_passability" in data["missing_capabilities"]

    # 2. GET /incidents/INC-002
    r = client.get("/incidents/INC-002")
    assert r.status_code == 200
    inc_data = r.json()
    assert inc_data["incident_type"] == "unknown"
    assert inc_data["status"] == "investigating"

    # 3. GET /incidents/INC-002/timeline
    r = client.get("/incidents/INC-002/timeline")
    assert r.status_code == 200
    timeline = r.json()
    timeline_types = [e["event_type"] for e in timeline]
    assert "CAPABILITY_GAP" in timeline_types

    # 4. POST /incidents/act2?sync=true
    r = client.post("/incidents/act2?sync=true")
    assert r.status_code == 200
    assert r.json()["gap_detected"] is True
