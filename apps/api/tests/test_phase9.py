"""
CIVIS — Phase 9 Tests: Generic Agent Runtime
Verifies declarative manifest instantiation, hard authority enforcement before tool calls,
class-level and instance-level execution, schema compliance, and HTTP workforce execution endpoint.
"""
import os
import sys
import pytest
from datetime import datetime, timedelta
from typing import Dict, Any

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Ensure test DB is used
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_phase9.db"

from core.database import Base, engine, SessionLocal
from models.agent import Agent
from models.authority import Authority
from services.event_bus import EventBus
from agents.runtime import GenericAgentRuntime, AgentRuntime
from engines.intelligence import SpecialistSpecification
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Create clean tables and seed base agents for Phase 9 testing."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from scripts.seed import seed
        seed(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.mark.asyncio
async def test_from_manifest_various_sources():
    """Test GenericAgentRuntime.from_manifest across DB models, Pydantic specs, and dicts."""
    db = SessionLocal()
    try:
        # 1. From DB Agent model (authorized base agent)
        weather_db = db.query(Agent).filter(Agent.id == "weather-agent").first()
        assert weather_db is not None
        runtime_db = GenericAgentRuntime.from_manifest(weather_db, db=db)
        assert runtime_db.agent_id == "weather-agent"
        assert runtime_db.authority_status == "authorized"
        assert "weather.read" in runtime_db.allowed_tools

        # 2. From SpecialistSpecification (Pydantic model)
        spec = SpecialistSpecification(
            id="passage-agent",
            name="Passage Agent",
            version="1.0.0",
            purpose="Assess flood passability",
            capability_ids=["flood_passability"],
            tools=["road.read", "weather.read", "imagery.read"],
            allowed_tools=[],
            system_prompt="Assess road depth and passability.",
            output_schema={"type": "object", "properties": {"is_passable": {"type": "boolean"}}},
            authority_status="untrusted",
        )
        runtime_spec = GenericAgentRuntime.from_manifest(spec)
        assert runtime_spec.agent_id == "passage-agent"
        assert runtime_spec.authority_status == "untrusted"
        assert runtime_spec.allowed_tools == []

        # 3. From raw dict manifest
        raw_manifest = {
            "id": "drone-agent",
            "name": "Drone Agent",
            "version": "1.0.0",
            "purpose": "Aerial surveillance",
            "capability_ids": ["aerial_recon"],
            "tools": ["imagery.read"],
            "allowed_tools": ["imagery.read"],
            "system_prompt": "Scan city zones.",
            "output_schema": {"type": "object"},
            "authority_status": "authorized",
        }
        runtime_dict = GenericAgentRuntime.from_manifest(raw_manifest)
        assert runtime_dict.agent_id == "drone-agent"
        assert runtime_dict.tools == ["imagery.read"]
        assert runtime_dict.allowed_tools == ["imagery.read"]
    finally:
        db.close()


@pytest.mark.asyncio
async def test_hard_authority_enforcement_and_denial_events():
    """Verify hard governance checks block unauthorized tools and emit UNAUTHORIZED_TOOL_DENIED."""
    db = SessionLocal()
    bus = EventBus()
    q = await bus.subscribe(incident_id="INC-AUTH-TEST")

    try:
        # Create an untrusted specialist with 3 tools requested
        untrusted_agent = Agent(
            id="untrusted-test-agent",
            name="Untrusted Test Agent",
            version="1.0.0",
            purpose="Testing governance boundaries",
            capability_ids=["flood_passability"],
            tools=["road.read", "weather.read", "imagery.read"],
            system_prompt="Test agent prompt",
            output_schema={"type": "object"},
            authority_status="untrusted",
            created_by="test",
        )
        db.add(untrusted_agent)
        db.commit()

        runtime = GenericAgentRuntime.from_manifest(untrusted_agent, db=db)
        # Because untrusted and no DB authorities, allowed_tools must be empty
        assert runtime.allowed_tools == []

        # Execute task
        task = {"location": "Zone 4", "description": "Flooded road check"}
        result = await runtime.execute(task, incident_id="INC-AUTH-TEST", bus=bus, db=db)

        # Verify all tools were denied
        assert len(result["denied_tools"]) == 3
        denied_names = [d["tool"] for d in result["denied_tools"]]
        assert "road.read" in denied_names
        assert "weather.read" in denied_names
        assert "imagery.read" in denied_names

        # Verify UNAUTHORIZED_TOOL_DENIED events published to bus
        events = []
        while not q.empty():
            events.append(await q.get())

        denial_events = [e for e in events if e.get("event_type") == "UNAUTHORIZED_TOOL_DENIED"]
        assert len(denial_events) == 3
        for de in denial_events:
            assert de["actor"] == "untrusted-test-agent"
            assert "Blocked by governance" in de["message"]

        # Now grant explicit 'allow' for 'road.read' and explicit 'deny' for 'weather.read'
        db.add(Authority(
            agent_id="untrusted-test-agent",
            tool_name="road.read",
            decision="allow",
            reason="Human supervisor temporary testing grant",
        ))
        db.add(Authority(
            agent_id="untrusted-test-agent",
            tool_name="weather.read",
            decision="deny",
            reason="Security policy: weather.read restricted",
        ))
        db.commit()

        # Re-instantiate runtime from DB
        runtime2 = GenericAgentRuntime.from_manifest(untrusted_agent, db=db)
        assert runtime2.allowed_tools == ["road.read"]

        # Execute again
        result2 = await runtime2.execute(task, incident_id="INC-AUTH-TEST", bus=bus, db=db)
        success_tools = [t["tool"] for t in result2["tool_calls"]]
        denied_tools2 = [d["tool"] for d in result2["denied_tools"]]

        assert "road.read" in success_tools
        assert "weather.read" in denied_tools2
        assert "imagery.read" in denied_tools2

    finally:
        db.close()


@pytest.mark.asyncio
async def test_class_level_execution_and_schema_compliance():
    """Verify GenericAgentRuntime.execute_agent class method and passage-agent deterministic reasoning."""
    db = SessionLocal()
    bus = EventBus()

    try:
        passage_manifest = {
            "id": "passage-agent",
            "name": "Passage Agent",
            "version": "1.0.0",
            "purpose": "Assess road passability",
            "capability_ids": ["flood_passability"],
            "tools": ["road.read"],
            "allowed_tools": ["road.read"],
            "authority_status": "authorized",
            "system_prompt": "Evaluate vehicle passability based on water depth.",
            "output_schema": {
                "type": "object",
                "properties": {
                    "is_passable": {"type": "boolean"},
                    "passability_status": {"type": "string"},
                    "water_depth_cm": {"type": "number"},
                },
            },
        }

        # 1. Clear road scenario
        clear_task = {"description": "Clear road on Velachery Main Road", "water_depth_cm": 5.0}
        res_clear = await GenericAgentRuntime.execute_agent(passage_manifest, clear_task, bus=bus, db=db)
        assert res_clear["status"] == "completed"
        assert res_clear["output"]["is_passable"] is True
        assert res_clear["output"]["passability_status"] == "PASSABLE"

        # 2. Deep flooding scenario
        flood_task = {"description": "Deep water underpass", "water_depth_cm": 70.0}
        res_flood = await GenericAgentRuntime.execute_agent(passage_manifest, flood_task, bus=bus, db=db)
        assert res_flood["output"]["is_passable"] is False
        assert res_flood["output"]["passability_status"] == "BLOCKED"
        assert res_flood["output"]["water_depth_cm"] == 70.0

        # 3. Obscured visibility scenario
        obscured_task = {"description": "Poor visibility obscured camera sensor"}
        res_obscured = await GenericAgentRuntime.execute_agent(passage_manifest, obscured_task, bus=bus, db=db)
        assert res_obscured["output"]["passability_status"] in ("UNKNOWN", "PASSABLE")

    finally:
        db.close()


def test_workforce_execute_http_endpoint():
    """Verify POST /workforce/agents/{agent_id}/execute endpoint."""
    client = TestClient(app)

    # 1. Execute authorized base agent (weather-agent)
    res = client.post(
        "/workforce/agents/weather-agent/execute",
        json={
            "task": {
                "id": "INC-001",
                "location": "Zone 4, Chennai",
                "description": "Heavy monsoon rainfall",
            },
            "incident_id": "INC-001",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["agent_id"] == "weather-agent"
    assert data["status"] == "completed"
    assert "rainfall_mm" in data["output"]
    assert any(t["tool"] == "weather.read" and t["status"] == "success" for t in data["tool_calls"])

    # 2. Non-existent agent returns 404
    res_404 = client.post(
        "/workforce/agents/non-existent-agent/execute",
        json={"task": {"location": "Zone 4"}},
    )
    assert res_404.status_code == 404
