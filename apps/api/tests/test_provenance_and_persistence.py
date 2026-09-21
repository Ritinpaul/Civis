"""
CIVIS — Phase 14 & Phase 15 Test Suite
Tests:
  - Phase 14: Act IV Capability Persistence ('flood_passability v1.0.0' registered as verified,
              workforce snapshot v2 with 5 agents and 5 capabilities, POST /demo/act4).
  - Phase 15: Provenance Engine (immutable audit timeline, 7-stage story grouping,
              cryptographic SHA-256 integrity verification, canonical 20-event sequence,
              and Provenance REST API).
"""
import os
import sys
import pytest
from datetime import datetime

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_phase14_15.db"

from fastapi.testclient import TestClient
from core.database import SessionLocal, init_db, engine, Base
from models import Agent, Capability, Authority, Incident, ProvenanceEvent, WorkforceSnapshot
from scripts.seed import seed
from engines.act4 import Act4Orchestrator
from engines.provenance import ProvenanceEngine, CANONICAL_20_EVENTS
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

        # Seed initial capabilities (4) and agents (4)
        seed(db)

        # Seed passage-agent in verified/authorized status
        passage = Agent(
            id="passage-agent",
            name="Passage Agent",
            version="1.1.0",
            purpose="Assess dynamic road flood passability",
            capability_ids=["flood_passability"],
            tools=["road.read", "weather.read", "imagery.read"],
            system_prompt="Assess road passability based on water depth and flow speed.",
            output_schema={},
            authority_status="authorized",
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


# ── Test 1: Phase 14 Capability Persistence (Act IV) ──────────────────────────
@pytest.mark.asyncio
async def test_act4_capability_persistence(setup_database):
    db = SessionLocal()
    try:
        orchestrator = Act4Orchestrator()

        # 1. Verify initial capability count is 4
        initial_caps = db.query(Capability).filter(Capability.status == "verified").count()
        assert initial_caps == 4

        # 2. Run Act IV capability persistence
        result = await orchestrator.persist_capability(incident_id="INC-002", db=db)
        assert result["act"] == "IV"
        assert result["status"] == "completed"
        assert result["total_capabilities"] == 5
        assert result["total_agents"] == 5
        assert result["growth"]["initial_capabilities"] == 4
        assert result["growth"]["current_capabilities"] == 5

        # 3. Verify Capability in database
        cap = db.query(Capability).filter(Capability.id == "flood_passability").first()
        assert cap is not None
        assert cap.status == "verified"
        assert cap.version == "1.0.0"
        assert cap.created_from_incident == "INC-002"

        # 4. Verify WorkforceSnapshot v2 in database
        snapshot = db.query(WorkforceSnapshot).order_by(WorkforceSnapshot.version.desc()).first()
        assert snapshot is not None
        assert snapshot.version == 2
        assert snapshot.trigger == "CAPABILITY_PERSISTED"
        assert len(snapshot.agent_ids) == 5
        assert len(snapshot.capability_ids) == 5
        assert "flood_passability" in snapshot.capability_ids
        assert "passage-agent" in snapshot.agent_ids

        # 5. Verify Provenance Events emitted
        events = db.query(ProvenanceEvent).filter(ProvenanceEvent.incident_id == "INC-002").all()
        event_types = [e.event_type for e in events]
        assert "CAPABILITY_PERSISTED" in event_types
        assert "WORKFORCE_SNAPSHOT" in event_types

    finally:
        db.close()


# ── Test 2: Phase 14 Act IV & Registry HTTP Endpoints ─────────────────────────
def test_act4_http_endpoints(setup_database):
    client = TestClient(app)

    # 1. POST /demo/act4 (sync mode)
    res_act4 = client.post("/demo/act4", json={"sync": True, "incident_id": "INC-002"})
    assert res_act4.status_code == 200
    data = res_act4.json()
    assert data["status"] == "completed"
    assert data["act"] == "IV"
    assert data["total_capabilities"] == 5

    # 2. GET /capabilities/registry-status
    res_reg = client.get("/capabilities/registry-status")
    assert res_reg.status_code == 200
    reg_data = res_reg.json()
    assert reg_data["total_capabilities"] == 5
    assert reg_data["is_flood_passability_registered"] is True

    # 3. GET /workforce/current
    res_wf = client.get("/workforce/current")
    assert res_wf.status_code == 200
    wf_data = res_wf.json()
    assert wf_data["total_capabilities"] == 5
    assert wf_data["total_agents"] == 5
    assert wf_data["latest_snapshot"]["version"] >= 2


# ── Test 3: Phase 15 Provenance Engine & Integrity Verification ───────────────
@pytest.mark.asyncio
async def test_provenance_engine_and_canonical_timeline(setup_database):
    db = SessionLocal()
    try:
        prov_engine = ProvenanceEngine()

        # 1. Emit simulated events to form the canonical 20-event sequence
        for item in CANONICAL_20_EVENTS:
            # Only add if not already present
            existing = (
                db.query(ProvenanceEvent)
                .filter(
                    ProvenanceEvent.incident_id == "INC-002",
                    ProvenanceEvent.event_type == item["event_type"],
                )
                .first()
            )
            if not existing:
                ev = ProvenanceEvent(
                    incident_id="INC-002",
                    event_type=item["event_type"],
                    actor=item["actor"],
                    message=item["description"],
                    payload={"step": item["step"], "stage": item["stage"]},
                    timestamp=datetime.utcnow(),
                )
                db.add(ev)
        db.commit()

        # 2. Test get_timeline
        timeline = prov_engine.get_timeline(incident_id="INC-002", db=db)
        assert len(timeline) >= 20
        event_types = [e["event_type"] for e in timeline]
        assert "INCIDENT_RECEIVED" in event_types
        assert "CAPABILITY_GAP" in event_types
        assert "SPECIALIST_CREATED" in event_types
        assert "CAPABILITY_PERSISTED" in event_types

        # 3. Test get_incident_story (7 stages)
        story = prov_engine.get_incident_story(incident_id="INC-002", db=db)
        assert story["incident_id"] == "INC-002"
        assert story["total_events"] >= 20
        assert "stages" in story
        assert len(story["stages"]["detection"]) > 0
        assert len(story["stages"]["capability_gap"]) > 0
        assert len(story["stages"]["adaptation_forge"]) > 0
        assert len(story["stages"]["repair_pass"]) > 0
        assert len(story["stages"]["governance_authority"]) > 0
        assert len(story["stages"]["swarm_persistence"]) > 0

        # 4. Test compute_integrity_hash (SHA-256)
        hash_res = prov_engine.compute_integrity_hash(incident_id="INC-002", db=db)
        assert hash_res["incident_id"] == "INC-002"
        assert hash_res["total_events"] >= 20
        assert hash_res["algorithm"] == "SHA-256"
        assert len(hash_res["sha256_hash"]) == 64  # Valid SHA-256 hex string
        assert hash_res["verified"] is True

        # 5. Canonical 20 definition
        canonical = prov_engine.get_canonical_20()
        assert len(canonical) == 20
        assert canonical[0]["event_type"] == "INCIDENT_RECEIVED"
        assert canonical[-1]["event_type"] == "CAPABILITY_PERSISTED"

    finally:
        db.close()


# ── Test 4: Phase 15 Provenance HTTP Endpoints ────────────────────────────────
def test_provenance_http_endpoints(setup_database):
    client = TestClient(app)

    # 1. GET /provenance?incident_id=INC-002
    res_prov = client.get("/provenance?incident_id=INC-002")
    assert res_prov.status_code == 200
    events = res_prov.json()
    assert len(events) >= 20

    # 2. GET /provenance/timeline/INC-002
    res_story = client.get("/provenance/timeline/INC-002")
    assert res_story.status_code == 200
    story_data = res_story.json()
    assert story_data["incident_id"] == "INC-002"
    assert "stages" in story_data
    assert "stage_summary" in story_data

    # 3. GET /provenance/verify/INC-002
    res_verify = client.get("/provenance/verify/INC-002")
    assert res_verify.status_code == 200
    verify_data = res_verify.json()
    assert verify_data["incident_id"] == "INC-002"
    assert len(verify_data["sha256_hash"]) == 64
    assert verify_data["verified"] is True

    # 4. GET /provenance/canonical-20
    res_canonical = client.get("/provenance/canonical-20")
    assert res_canonical.status_code == 200
    canonical_list = res_canonical.json()
    assert len(canonical_list) == 20
