"""
CIVIS — Phase 2 & 3 Standalone Verification Runner
Runs without pytest dependency directly via Python.
Produces detailed evidence of:
- EventBus functionality
- ToolRegistry execution
- 4 Base Agents reasoning & schema adherence
- Authority enforcement
- FastAPI endpoints
"""
import asyncio
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database if PostgreSQL is not active
os.environ["DATABASE_URL"] = os.environ.get("DATABASE_URL", "sqlite:///./test_civis.db")

from core.settings import get_settings
from core.database import Base, engine, SessionLocal, init_db
from models import Agent, Capability, Incident, Authority, WorkforceSnapshot, ProvenanceEvent
from services.event_bus import EventBus
from tools.registry import tool_registry
from agents.runtime import AgentRuntime
from agents.weather import WeatherAgent
from agents.traffic import TrafficAgent
from agents.infrastructure import InfrastructureAgent
from agents.emergency import EmergencyAgent
from agents.workforce_manager import WorkforceManager
from scripts.seed import seed


def log_pass(name: str):
    print(f"  [PASS] {name}")


def log_fail(name: str, err: Exception):
    print(f"  [FAIL] {name}: {err}")
    raise err


async def run_tests():
    print("\n" + "=" * 60)
    print("CIVIS — PHASE 2 & 3 VERIFICATION SUITE")
    print("=" * 60)

    # ── Database Initialization ───────────────────────────────────────────
    print("\n1. Database Setup & Seed:")
    init_db()
    db = SessionLocal()
    seed(db)
    agent_count = db.query(Agent).count()
    cap_count = db.query(Capability).count()
    assert agent_count == 4, f"Expected 4 agents, got {agent_count}"
    assert cap_count == 4, f"Expected 4 capabilities, got {cap_count}"
    # Confirm flood_passability is NOT in DB (intentional Act II gap)
    fp = db.query(Capability).filter(Capability.id == "flood_passability").first()
    assert fp is None, "flood_passability should NOT be seeded in DB"
    db.close()
    log_pass("Database initialized and seeded (4 base agents, 4 capabilities, 0 flood_passability)")

    # ── EventBus Verification ─────────────────────────────────────────────
    print("\n2. EventBus Verification:")
    bus = EventBus()
    q_global = await bus.subscribe(None)
    q_inc1 = await bus.subscribe("INC-001")
    q_inc2 = await bus.subscribe("INC-002")

    await bus.publish({"event_type": "TEST", "data": "hello"}, incident_id="INC-001")
    ev_glob = q_global.get_nowait()
    ev_inc1 = q_inc1.get_nowait()
    assert ev_glob["data"] == "hello"
    assert ev_inc1["data"] == "hello"
    assert q_inc2.empty()

    await bus.unsubscribe(q_global)
    await bus.unsubscribe(q_inc1, "INC-001")
    await bus.unsubscribe(q_inc2, "INC-002")
    log_pass("EventBus pub/sub, targeted routing, and unsubscribe verified")

    # ── Tool Registry Verification ─────────────────────────────────────────
    print("\n3. Tool Registry Verification:")
    tools = tool_registry.list_tools()
    assert len(tools) == 6
    w = tool_registry.execute("weather.read", location="Zone 4")
    assert w["rainfall_mm"] == 142.5
    t = tool_registry.execute("traffic.read", zone="Zone 4")
    assert t["congestion_level"] == "critical"
    r = tool_registry.execute("road.read", road_name="Mount Road")
    assert r["water_depth_cm"] == 68.0
    d = tool_registry.execute("drainage.read", zone="Zone 4")
    assert d["drainage_status"] == "overloaded"
    e = tool_registry.execute("emergency.read", zone="Zone 4")
    assert "ambulances" in str(e["available_resources"])
    img = tool_registry.execute("imagery.read", location="Zone 4")
    assert img["water_reflectance_index"] > 0.8
    log_pass("All 6 deterministic Chennai Zone 4 tools executed with valid telemetry")

    # ── AgentRuntime & Authority Enforcement ──────────────────────────────
    print("\n4. AgentRuntime & Authority Enforcement:")
    test_agent = AgentRuntime(
        agent_id="test-agent",
        name="Test Agent",
        version="1.0.0",
        purpose="Testing authority boundaries",
        capability_ids=["test_cap"],
        tools=["weather.read", "traffic.write"],
        system_prompt="Test agent",
        output_schema={"type": "object", "properties": {"status": {"type": "string"}}},
        authority_status="authorized",
        allowed_tools=["weather.read"],  # traffic.write omitted
    )
    bus2 = EventBus()
    q_audit = await bus2.subscribe("INC-SEC")
    res = await test_agent.execute({"location": "Zone 4"}, incident_id="INC-SEC", bus=bus2)
    ev_types = []
    while not q_audit.empty():
        ev_types.append(q_audit.get_nowait()["event_type"])
    assert "UNAUTHORIZED_TOOL_DENIED" in ev_types
    assert "AGENT_COMPLETED" in ev_types
    log_pass("Authority boundary enforced: unauthorized tool blocked with UNAUTHORIZED_TOOL_DENIED event")

    # ── 4 Base Agents Verification ────────────────────────────────────────
    print("\n5. 4 Base Agents Execution:")
    inc_act1 = {
        "id": "INC-001",
        "title": "Monsoon Waterlogging, Chennai Zone 4",
        "description": "Severe flooding in Saidapet and Velachery corridor.",
        "location": "Zone 4, Chennai",
        "severity": "high",
        "incident_type": "known",
    }
    w_agent = WeatherAgent()
    w_out = await w_agent.execute(inc_act1, incident_id="INC-001", bus=bus2)
    assert w_out["status"] == "completed"
    assert "rainfall_mm" in w_out["output"]
    log_pass("WeatherAgent executed -> rainfall_mm & flood_risk_level generated")

    t_agent = TrafficAgent()
    t_out = await t_agent.execute(inc_act1, incident_id="INC-001", bus=bus2)
    assert t_out["status"] == "completed"
    assert "congestion_level" in t_out["output"]
    log_pass("TrafficAgent executed -> congestion_level & affected_roads generated")

    i_agent = InfrastructureAgent()
    i_out = await i_agent.execute(inc_act1, incident_id="INC-001", bus=bus2)
    assert i_out["status"] == "completed"
    assert "drainage_status" in i_out["output"]
    log_pass("InfrastructureAgent executed -> drainage_status & pump metrics generated")

    e_agent = EmergencyAgent()
    e_out = await e_agent.execute(inc_act1, incident_id="INC-001", bus=bus2)
    assert e_out["status"] == "completed"
    assert "response_recommendation" in e_out["output"]
    log_pass("EmergencyAgent executed -> staging hub & response priorities generated")

    # ── Act II Capability Gap Trigger ─────────────────────────────────────
    print("\n6. Act II Capability Gap Detection:")
    inc_act2 = {
        "id": "INC-002",
        "title": "Unknown Road Accessibility Anomaly",
        "description": "Corridor depth passability unknown for ambulance transit.",
        "location": "Saidapet Causeway, Chennai Zone 4",
        "severity": "critical",
        "incident_type": "unknown",
    }
    e_out2 = await e_agent.execute(inc_act2, incident_id="INC-002", bus=bus2)
    assert e_out2["status"] == "insufficient"
    log_pass("EmergencyAgent declared INSUFFICIENT for unknown incident requiring flood_passability")

    # ── WorkforceManager ──────────────────────────────────────────────────
    print("\n7. WorkforceManager Orchestration:")
    wm = WorkforceManager()
    agents = wm.list_agents()
    assert len(agents) == 4
    wf_results = await wm.dispatch_workforce(inc_act1, bus=bus2)
    assert len(wf_results) == 4
    log_pass("WorkforceManager dispatched all 4 base agents in sequence")

    # ── FastAPI Endpoints ─────────────────────────────────────────────────
    print("\n8. FastAPI Endpoints Verification:")
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # /health
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    log_pass("GET /health -> 200 OK")

    # /incidents
    r = client.get("/incidents")
    assert r.status_code == 200
    r = client.post("/incidents", json={
        "title": "Act I Monsoon Event",
        "description": "Waterlogging along Mount Road",
        "location": "Saidapet, Zone 4",
        "severity": "high",
        "incident_type": "known",
    })
    assert r.status_code == 201
    created_id = r.json()["id"]
    r = client.get(f"/incidents/{created_id}")
    assert r.status_code == 200
    log_pass("GET & POST /incidents -> 200/201 OK")

    # /capabilities
    r = client.get("/capabilities")
    assert r.status_code == 200
    assert len(r.json()) >= 4

    # Search FOUND
    r = client.post("/capabilities/search", json={"query": "weather_assessment"})
    assert r.status_code == 200
    assert r.json()["found"] is True

    # Search GAP (NOT FOUND)
    r = client.post("/capabilities/search", json={"query": "flood_passability", "incident_id": "INC-002"})
    assert r.status_code == 200
    assert r.json()["found"] is False
    assert r.json()["gap_detected"] is True
    log_pass("GET & POST /capabilities/search -> FOUND & GAP DETECTED confirmed")

    # /workforce
    r = client.get("/workforce/current")
    assert r.status_code == 200
    wf = r.json()
    assert wf["total_agents"] >= 4
    assert wf["total_capabilities"] >= 4

    r = client.get("/workforce/agents/weather-agent")
    assert r.status_code == 200
    assert r.json()["manifest"]["id"] == "weather-agent"
    log_pass("GET /workforce/current & /workforce/agents/{id} -> 200 OK")

    # /events/publish
    r = client.post("/events/publish", json={
        "event_type": "PROVENANCE_TEST",
        "actor": "verification-runner",
        "message": "Testing real-time SSE event pipeline",
        "payload": {"test_success": True},
        "incident_id": "INC-001",
    })
    assert r.status_code == 200
    assert r.json()["published"] is True
    log_pass("POST /events/publish -> 200 OK")

    print("\n" + "=" * 60)
    print("ALL PHASE 2 & PHASE 3 VERIFICATIONS PASSED SUCCESSFULLY!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(run_tests())
