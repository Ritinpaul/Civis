"""
CIVIS — Phase 10 Tests: Evaluation Engine
Verifies:
- 7-test evaluation suite execution (T01-T07)
- The pivotal failure moment: T03 fails on Run 1 (returns PASSABLE, expected UNKNOWN)
- Agent state transitions: UNTRUSTED -> EVALUATING -> FAILED
- Repaired run (Run 2): T03 returns UNKNOWN -> state becomes VERIFIED
- Provenance events: EVALUATION_STARTED, TEST_CASE_EVALUATED, EVALUATION_FAILED / EVALUATION_PASSED
- HTTP endpoints: POST /evaluations/run, GET /evaluations, GET /evaluations/{agent_id}, GET /evaluations/test-cases/{agent_id}
"""
import os
import sys
import pytest
from typing import Dict, Any

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_phase10.db"

from core.database import Base, engine, SessionLocal
from models.agent import Agent
from models.evaluation import Evaluation
from services.event_bus import EventBus
from engines.evaluation import EvaluationEngine
from engines.intelligence import DEMO_RESPONSES
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Create clean tables and seed base agents for Phase 10 testing."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from scripts.seed import seed
        seed(db)

        # Seed initial Passage Agent v1.0.0 (from DEMO_RESPONSES)
        spec = DEMO_RESPONSES["specify_specialist"]
        agent = Agent(
            id=spec["id"],
            name=spec["name"],
            version=spec["version"],
            purpose=spec["purpose"],
            capability_ids=spec["capability_ids"],
            tools=spec["tools"],
            system_prompt=spec["system_prompt"],
            output_schema=spec["output_schema"],
            authority_status="untrusted",
            status="active",
            created_by="civis-forge",
        )
        db.add(agent)
        db.commit()
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.mark.asyncio
async def test_evaluation_engine_initial_run_failure():
    """
    Verify initial evaluation run:
    - 7 test cases executed
    - T03 fails (returns PASSABLE, expected UNKNOWN)
    - 6/7 passed, 1 failed
    - Agent status transitions to 'failed'
    - EVALUATION_STARTED -> 7x TEST_CASE_EVALUATED -> EVALUATION_FAILED events emitted
    """
    db = SessionLocal()
    bus = EventBus()
    q = await bus.subscribe(incident_id="INC-002")

    engine_instance = EvaluationEngine(bus=bus, delay=0.0)

    try:
        result = await engine_instance.evaluate_specialist(
            agent_id="passage-agent",
            db=db,
            incident_id="INC-002",
            run_number=1,
            repair_applied=False,
        )

        # 1. Assert result summary
        assert result["agent_id"] == "passage-agent"
        assert result["run_number"] == 1
        assert result["repair_applied"] is False
        assert result["total_tests"] == 7
        assert result["passed_count"] == 6
        assert result["failed_count"] == 1
        assert result["status"] == "failed"
        assert result["authority_status"] == "failed"
        assert result["failed_test_ids"] == ["T03"]

        # 2. Assert T03 specifics in returned evaluations
        t03_eval = next(e for e in result["evaluations"] if e["test_id"] == "T03")
        assert t03_eval["expected_output"] == "UNKNOWN"
        assert t03_eval["actual_output"] == "PASSABLE"
        assert t03_eval["status"] == "failed"
        assert "Verdict mismatch" in t03_eval["reason"]

        # 3. Assert DB Agent status updated to 'failed'
        agent_db = db.query(Agent).filter(Agent.id == "passage-agent").first()
        assert agent_db is not None
        assert agent_db.authority_status == "failed"

        # 4. Assert DB Evaluations table records
        db_evals = db.query(Evaluation).filter(
            Evaluation.agent_id == "passage-agent",
            Evaluation.run_number == 1,
        ).all()
        assert len(db_evals) == 7
        t03_db = next(e for e in db_evals if e.test_id == "T03")
        assert t03_db.status == "failed"
        assert t03_db.expected_output == "UNKNOWN"
        assert t03_db.actual_output == "PASSABLE"

        # 5. Assert Provenance Events emitted
        events = []
        while not q.empty():
            events.append(await q.get())

        event_types = [e.get("event_type") for e in events]
        assert "EVALUATION_STARTED" in event_types
        assert event_types.count("TEST_CASE_EVALUATED") == 7
        assert "EVALUATION_FAILED" in event_types
        assert "EVALUATION_PASSED" not in event_types

        failed_event = next(e for e in events if e.get("event_type") == "EVALUATION_FAILED")
        assert failed_event["actor"] == "evaluation-engine"
        assert "6/7 passed, 1 failed" in failed_event["message"]
        assert "T03" in failed_event["payload"]["failed_tests"]

    finally:
        db.close()


@pytest.mark.asyncio
async def test_evaluation_engine_repaired_run_success():
    """
    Verify repaired evaluation run (Run 2):
    - Update system prompt with repaired safety rule (v1.1.0)
    - T03 passes (returns UNKNOWN)
    - 7/7 passed, 0 failed
    - Agent status transitions to 'verified'
    - EVALUATION_STARTED -> 7x TEST_CASE_EVALUATED -> EVALUATION_PASSED events emitted
    """
    db = SessionLocal()
    bus = EventBus()
    q = await bus.subscribe(incident_id="INC-002")

    engine_instance = EvaluationEngine(bus=bus, delay=0.0)

    try:
        # Simulate Phase 11 repair by applying repaired system prompt
        repaired_plan = DEMO_RESPONSES["plan_repair"]
        agent = db.query(Agent).filter(Agent.id == "passage-agent").first()
        assert agent is not None
        agent.system_prompt = repaired_plan["repaired_system_prompt"]
        agent.version = repaired_plan["repaired_version"]
        db.commit()

        result = await engine_instance.evaluate_specialist(
            agent_id="passage-agent",
            db=db,
            incident_id="INC-002",
            run_number=2,
            repair_applied=True,
        )

        # 1. Assert result summary
        assert result["run_number"] == 2
        assert result["repair_applied"] is True
        assert result["total_tests"] == 7
        assert result["passed_count"] == 7
        assert result["failed_count"] == 0
        assert result["status"] == "passed"
        assert result["authority_status"] == "verified"
        assert result["failed_test_ids"] == []

        # 2. Assert T03 passed
        t03_eval = next(e for e in result["evaluations"] if e["test_id"] == "T03")
        assert t03_eval["expected_output"] == "UNKNOWN"
        assert t03_eval["actual_output"] == "UNKNOWN"
        assert t03_eval["status"] == "passed"

        # 3. Assert DB Agent status is now 'verified'
        db.refresh(agent)
        assert agent.authority_status == "verified"

        # 4. Assert Provenance Events emitted
        events = []
        while not q.empty():
            events.append(await q.get())

        event_types = [e.get("event_type") for e in events]
        assert "EVALUATION_STARTED" in event_types
        assert event_types.count("TEST_CASE_EVALUATED") == 7
        assert "EVALUATION_PASSED" in event_types

        passed_event = next(e for e in events if e.get("event_type") == "EVALUATION_PASSED")
        assert passed_event["actor"] == "evaluation-engine"
        assert "7/7 test cases verified" in passed_event["message"]

    finally:
        db.close()


def test_evaluations_http_endpoints():
    """Verify HTTP endpoints for evaluations router."""
    client = TestClient(app)

    # 1. GET /evaluations/test-cases/{agent_id}
    res_tc = client.get("/evaluations/test-cases/passage-agent")
    assert res_tc.status_code == 200
    tc_data = res_tc.json()
    assert tc_data["agent_id"] == "passage-agent"
    assert len(tc_data["test_cases"]) == 7

    # 2. GET /evaluations
    res_list = client.get("/evaluations?agent_id=passage-agent")
    assert res_list.status_code == 200
    evals = res_list.json()
    assert len(evals) >= 7

    # 3. GET /evaluations/{agent_id}
    res_detail = client.get("/evaluations/passage-agent")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["agent_id"] == "passage-agent"
    assert 1 in detail["runs"]

    # 4. POST /evaluations/run
    res_run = client.post(
        "/evaluations/run",
        json={
            "agent_id": "passage-agent",
            "incident_id": "INC-002",
            "run_number": 3,
            "repair_applied": True,
            "sync": True,
        },
    )
    assert res_run.status_code == 200
    run_data = res_run.json()
    assert run_data["agent_id"] == "passage-agent"
    assert run_data["total_tests"] == 7

    # 5. Non-existent agent returns 404
    res_404 = client.post(
        "/evaluations/run",
        json={"agent_id": "non-existent-agent"},
    )
    assert res_404.status_code == 404
