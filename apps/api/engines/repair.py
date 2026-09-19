"""
CIVIS — Repair Engine (Phase 11)
Executes failure analysis and prompt repair for specialist agents.
Diagnoses why an agent failed an evaluation test case (specifically T03 returning PASSABLE instead of UNKNOWN),
produces an improved system prompt incorporating strict epistemic safety rules, updates the agent in DB/workforce,
and triggers re-evaluation (Run 2).
"""
import asyncio
import logging
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from core.database import SessionLocal
from models.agent import Agent
from models.evaluation import Evaluation
from services.event_bus import EventBus, get_event_bus
from engines.intelligence import IntelligenceEngine, get_intelligence_engine, FailureAnalysis, RepairPlan, DEMO_RESPONSES
from engines.evaluation import EvaluationEngine, get_evaluation_engine
from agents.workforce_manager import WorkforceManager, get_workforce_manager
from agents.runtime import GenericAgentRuntime

logger = logging.getLogger("civis.repair")


class RepairEngine:
    """
    Orchestrates the specialist repair cycle:
    1. Detects failure (e.g. T03 on passage-agent v1.0.0)
    2. Invokes Gemini 2.5 Pro (Job 5: analyze_failure) to diagnose root cause
    3. Invokes Gemini 2.5 Pro (Job 6: plan_repair) to generate safe v1.1.0 system prompt
    4. Updates Agent in DB and WorkforceManager runtime
    5. Triggers re-evaluation (Run 2) to confirm T03 passes
    """

    def __init__(
        self,
        bus: Optional[EventBus] = None,
        intelligence: Optional[IntelligenceEngine] = None,
        evaluation_engine: Optional[EvaluationEngine] = None,
        workforce: Optional[WorkforceManager] = None,
        delay: float = 0.0,
    ):
        self.bus = bus or get_event_bus()
        self.intelligence = intelligence or get_intelligence_engine()
        self.eval_engine = evaluation_engine or get_evaluation_engine()
        self.workforce = workforce or get_workforce_manager()
        self.delay = delay

    async def _sleep(self):
        if self.delay > 0:
            await asyncio.sleep(self.delay)

    async def repair_specialist(
        self,
        agent_id: str,
        db: Session,
        incident_id: Optional[str] = None,
        failed_test_id: str = "T03",
        auto_reevaluate: bool = True,
    ) -> Dict[str, Any]:
        """
        Execute the full repair workflow for a failed specialist agent.
        """
        logger.info(f"[RepairEngine] Starting repair for agent='{agent_id}', test='{failed_test_id}'")

        # ── 1. Load Agent ─────────────────────────────────────────────────────
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise KeyError(f"Agent '{agent_id}' not found in registry")

        # Transition status to 'repairing'
        agent.authority_status = "repairing"
        db.commit()
        db.refresh(agent)

        # ── 2. Emit REPAIR_STARTED ────────────────────────────────────────────
        await self.bus.publish_provenance(
            event_type="REPAIR_STARTED",
            actor="repair-engine",
            message=f"Repair initiated for specialist '{agent.name}' ({agent.id}) following failure on test {failed_test_id}.",
            payload={
                "agent_id": agent.id,
                "agent_name": agent.name,
                "failed_test_id": failed_test_id,
                "current_version": agent.version,
            },
            incident_id=incident_id,
            db=db,
        )
        await self._sleep()

        # ── 3. Retrieve Failed Evaluation Record ──────────────────────────────
        failed_eval = (
            db.query(Evaluation)
            .filter(
                Evaluation.agent_id == agent_id,
                Evaluation.test_id == failed_test_id,
                Evaluation.status == "failed",
            )
            .order_by(Evaluation.evaluated_at.desc())
            .first()
        )

        if failed_eval:
            test_case = {
                "test_id": failed_eval.test_id,
                "test_name": failed_eval.test_name,
                "input_data": failed_eval.input_data,
                "expected_output": failed_eval.expected_output,
            }
            actual_output = failed_eval.actual_output
            agent_reasoning = failed_eval.reason or ""
        else:
            # Fallback to canonical T03 definition if not found in DB
            cases = DEMO_RESPONSES["generate_evaluation_cases"]["test_cases"]
            t03 = next((c for c in cases if c["test_id"] == failed_test_id), cases[2])
            test_case = t03
            actual_output = "PASSABLE"
            agent_reasoning = "Overconfident extrapolation based on high-clearance threshold without checking water current velocity."

        # ── 4. Job 5: Analyze Failure (gemini-2.5-pro) ─────────────────────────
        analysis: FailureAnalysis = await self.intelligence.analyze_failure(
            test_case=test_case,
            actual_output=actual_output,
            agent_reasoning=agent_reasoning,
        )

        await self.bus.publish_provenance(
            event_type="FAILURE_ANALYZED",
            actor="gemini-pro",
            message=f"Failure diagnosed for {failed_test_id}: {analysis.failure_category} — {analysis.root_cause[:120]}...",
            payload=analysis.model_dump(),
            incident_id=incident_id,
            db=db,
        )
        await self._sleep()

        # ── 5. Job 6: Plan Repair (gemini-2.5-pro) ─────────────────────────────
        repair_plan: RepairPlan = await self.intelligence.plan_repair(
            analysis=analysis,
            current_manifest=agent.to_manifest(),
        )

        await self.bus.publish_provenance(
            event_type="REPAIR_PLANNED",
            actor="gemini-pro",
            message=(
                f"Repair planned for '{agent.name}': v{repair_plan.original_version} -> v{repair_plan.repaired_version}. "
                f"Changes: {'; '.join(repair_plan.changes_made)}."
            ),
            payload=repair_plan.model_dump(),
            incident_id=incident_id,
            db=db,
        )
        await self._sleep()

        # ── 6. Apply Repair to Agent ──────────────────────────────────────────
        agent.system_prompt = repair_plan.repaired_system_prompt
        agent.version = repair_plan.repaired_version
        db.commit()
        db.refresh(agent)

        # Update runtime in WorkforceManager
        repaired_runtime = GenericAgentRuntime.from_manifest(agent, db=db)
        self.workforce.register_agent(repaired_runtime)

        await self.bus.publish_provenance(
            event_type="SPECIALIST_REPAIRED",
            actor="repair-engine",
            message=f"Specialist '{agent.name}' updated to v{agent.version} with safety constraints applied.",
            payload=agent.to_dict(),
            incident_id=incident_id,
            db=db,
        )
        await self._sleep()

        # ── 7. Optional Re-evaluation (Run 2) ─────────────────────────────────
        reeval_result = None
        if auto_reevaluate:
            reeval_result = await self.eval_engine.evaluate_specialist(
                agent_id=agent.id,
                db=db,
                incident_id=incident_id,
                run_number=2,
                repair_applied=True,
            )

        return {
            "status": "repaired",
            "agent_id": agent.id,
            "agent_name": agent.name,
            "original_version": repair_plan.original_version,
            "repaired_version": repair_plan.repaired_version,
            "analysis": analysis.model_dump(),
            "repair_plan": repair_plan.model_dump(),
            "re-evaluation": reeval_result,
            "authority_status": agent.authority_status,
        }


# Global singleton
repair_engine = RepairEngine()


def get_repair_engine() -> RepairEngine:
    """Dependency / accessor for RepairEngine."""
    return repair_engine
