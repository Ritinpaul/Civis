"""
CIVIS — Phase 11 Tests: Repair Engine
Verifies:
- Failure diagnosis via Gemini 2.5 Pro (Job 5: analyze_failure)
- Safety-governed prompt repair via Gemini 2.5 Pro (Job 6: plan_repair)
- Manifest update in DB and WorkforceManager runtime (v1.0.0 -> v1.1.0)
- Automatic re-evaluation (Run 2) where T03 switches from FAILED to PASSED
- State machine transition: FAILED -> REPAIRING -> (EVALUATING) -> VERIFIED
- Provenance events: REPAIR_STARTED, FAILURE_ANALYZED, REPAIR_PLANNED, SPECIALIST_REPAIRED, EVALUATION_PASSED
- HTTP endpoints: POST /repair, GET /repair/history/{agent_id}
"""
import os
import sys
import pytest
from typing import Dict, Any

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_civis_phase11.db"

from core.database import Base, engine, SessionLocal
from models.agent import Agent
from models.evaluation import Evaluation
from services.event_bus import EventBus
from engines.evaluation import EvaluationEngine
from engines.repair import RepairEngine
from engines.intelligence import DEMO_RESPONSES
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Create clean tables and seed base agents for Phase 11 testing."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from scripts.seed import seed
        seed(db)

        # Seed initial Passage Agent v1.0.0
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
async def test_repair_specialist_pipeline():
    """
    Test full repair pipeline:
    1. Run initial evaluation -> T03 fails, status becomes 'failed'
    2. Run repair_specialist -> Gemini diagnoses T03, generates v1.1.0 prompt with safety rule
    3. Re-evaluation runs -> T03 passes, status becomes 'verified'
    4. Provenance trail contains REPAIR_STARTED -> FAILURE_ANALYZED -> REPAIR_PLANNED -> SPECIALIST_REPAIRED -> EVALUATION_PASSED
    """
    db = SessionLocal()
    bus = EventBus()
    q = await bus.subscribe(incident_id="INC-002")

    eval_engine = EvaluationEngine(bus=bus, delay=0.0)
    repair_engine = RepairEngine(bus=bus, evaluation_engine=eval_engine, delay=0.0)

    try:
        # Step 1: Initial evaluation (Run 1) -> T03 fails
        eval_run1 = await eval_engine.evaluate_specialist(
            agent_id="passage-agent",
            db=db,
            incident_id="INC-002",
            run_number=1,
            repair_applied=False,
        )
        assert eval_run1["status"] == "failed"
        assert eval_run1["failed_test_ids"] == ["T03"]

        agent_before = db.query(Agent).filter(Agent.id == "passage-agent").first()
        assert agent_before.authority_status == "failed"
        assert agent_before.version == "1.0.0"

        # Step 2: Trigger Repair
        repair_res = await repair_engine.repair_specialist(
            agent_id="passage-agent",
            db=db,
            incident_id="INC-002",
            failed_test_id="T03",
            auto_reevaluate=True,
        )

        # 1. Assert repair summary
        assert repair_res["status"] == "repaired"
        assert repair_res["agent_id"] == "passage-agent"
        assert repair_res["original_version"] == "1.0.0"
        assert repair_res["repaired_version"] == "1.1.0"
        assert repair_res["authority_status"] == "verified"

        # 2. Assert failure analysis
        analysis = repair_res["analysis"]
        assert analysis["test_id"] == "T03"
        assert "overconfident_extrapolation" in analysis["failure_category"]
        assert len(analysis["recommended_fix"]) > 0

        # 3. Assert repair plan
        plan = repair_res["repair_plan"]
        assert plan["repaired_version"] == "1.1.0"
        assert "ambiguous condition rule" in plan["repaired_system_prompt"].lower()

        # 4. Assert re-evaluation (Run 2) passed
        reeval = repair_res["re-evaluation"]
        assert reeval is not None
        assert reeval["run_number"] == 2
        assert reeval["repair_applied"] is True
        assert reeval["passed_count"] == 7
        assert reeval["failed_count"] == 0
        assert reeval["status"] == "passed"

        # 5. Assert DB Agent updated
        db.refresh(agent_before)
        assert agent_before.version == "1.1.0"
        assert agent_before.authority_status == "verified"
        assert "ambiguous condition rule" in agent_before.system_prompt.lower()

        # 6. Assert DB Evaluation records exist for both runs
        evals = db.query(Evaluation).filter(Evaluation.agent_id == "passage-agent").all()
        assert len(evals) == 14  # 7 for Run 1, 7 for Run 2

        t03_run1 = next(e for e in evals if e.test_id == "T03" and e.run_number == 1)
        t03_run2 = next(e for e in evals if e.test_id == "T03" and e.run_number == 2)
        assert t03_run1.status == "failed"
        assert t03_run1.actual_output == "PASSABLE"
        assert t03_run2.status == "passed"
        assert t03_run2.actual_output == "UNKNOWN"

        # 7. Assert Provenance Events
        events = []
        while not q.empty():
            events.append(await q.get())

        event_types = [e.get("event_type") for e in events]
        assert "REPAIR_STARTED" in event_types
        assert "FAILURE_ANALYZED" in event_types
        assert "REPAIR_PLANNED" in event_types
        assert "SPECIALIST_REPAIRED" in event_types
        assert "EVALUATION_PASSED" in event_types

    finally:
        db.close()


def test_repair_http_endpoints():
    """Verify HTTP endpoints for repair router."""
    client = TestClient(app)

    # 1. POST /repair
    res_repair = client.post(
        "/repair",
        json={
            "agent_id": "passage-agent",
            "incident_id": "INC-002",
            "failed_test_id": "T03",
            "auto_reevaluate": True,
            "sync": True,
        },
    )
    assert res_repair.status_code == 200
    data = res_repair.json()
    assert data["status"] == "repaired"
    assert data["repaired_version"] == "1.1.0"
    assert data["authority_status"] == "verified"

    # 2. GET /repair/history/{agent_id}
    res_hist = client.get("/repair/history/passage-agent")
    assert res_hist.status_code == 200
    hist = res_hist.json()
    assert hist["agent_id"] == "passage-agent"
    assert hist["repaired"] is True
    assert len(hist["run2_evaluations"]) >= 7

    # 3. Non-existent agent returns 404
    res_404 = client.post(
        "/repair",
        json={"agent_id": "non-existent-agent"},
    )
    assert res_404.status_code == 404
