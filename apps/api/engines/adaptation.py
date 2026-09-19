"""
CIVIS — Adaptation Engine (Forge)
Implements Phase 8: Capability Gap → Specialist Agent Creation.

Core Rule: Gemini → JSON Manifest → Runtime (NO code generation).
Uses Gemini 2.5 Pro to design the specialist AgentManifest, creates the Agent
in the database with status='untrusted', and registers it in the workforce runtime.

Timeline:
  1. ADAPTATION_STARTED   — Triggered by capability gap
  2. SPECIALIST_SPECIFIED — Gemini 2.5 Pro designs manifest
  3. SPECIALIST_CREATED   — Agent persisted as UNTRUSTED
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from core.database import SessionLocal
from core.settings import get_settings
from models.agent import Agent
from models.incident import Incident
from services.event_bus import get_event_bus, EventBus
from engines.intelligence import get_intelligence_engine, IntelligenceEngine, SpecialistSpecification
from agents.runtime import AgentRuntime
from agents.workforce_manager import get_workforce_manager, WorkforceManager

logger = logging.getLogger("civis.forge")
settings = get_settings()


class AdaptationEngine:
    """
    The CIVIS Forge: creates new specialist agents in response to capability gaps.
    Transforms Gemini reasoning into structured, governed runtime manifests.
    """

    def __init__(
        self,
        bus: Optional[EventBus] = None,
        intelligence: Optional[IntelligenceEngine] = None,
        workforce: Optional[WorkforceManager] = None,
    ):
        self.bus = bus or get_event_bus()
        self.intelligence = intelligence or get_intelligence_engine()
        self.workforce = workforce or get_workforce_manager()

    async def forge_specialist(
        self,
        missing_capability: str = "flood_passability",
        incident_id: Optional[str] = None,
        incident: Optional[Dict[str, Any]] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """
        Execute the specialist forging pipeline:
        1. Emit ADAPTATION_STARTED
        2. Gemini 2.5 Pro designs AgentManifest
        3. Emit SPECIALIST_SPECIFIED
        4. Persist Agent in DB with authority_status='untrusted'
        5. Register AgentRuntime in workforce
        6. Emit SPECIALIST_CREATED
        """
        logger.info(f"[Forge] Starting specialist forging for missing capability: '{missing_capability}'")
        owns_db = False
        if db is None:
            db = SessionLocal()
            owns_db = True

        try:
            # Resolve incident data
            incident_data = incident or {}
            if not incident_data and incident_id:
                inc = db.query(Incident).filter(Incident.id == incident_id).first()
                if inc:
                    incident_data = inc.to_dict()

            if not incident_data:
                incident_data = {
                    "id": incident_id or "INC-002",
                    "title": "Unknown Road Accessibility Anomaly",
                    "location": "Saidapet Causeway, Chennai Zone 4",
                    "description": "Submerged road with unknown passability depth for emergency vehicles.",
                    "severity": "critical",
                    "incident_type": "unknown",
                }

            # ── 1. Emit ADAPTATION_STARTED ─────────────────────────────────────
            await self.bus.publish_provenance(
                event_type="ADAPTATION_STARTED",
                actor="civis-forge",
                message=f"Capability gap detected: '{missing_capability}'. CIVIS adaptation engine activated.",
                payload={
                    "missing_capability": missing_capability,
                    "incident_id": incident_id,
                    "trigger": "CAPABILITY_GAP",
                },
                incident_id=incident_id,
                db=db,
            )

            # ── 2. Gemini 2.5 Pro: Specify Specialist ─────────────────────────
            spec: SpecialistSpecification = await self.intelligence.specify_specialist(
                missing_capability=missing_capability,
                incident=incident_data,
            )

            # ── 3. Emit SPECIALIST_SPECIFIED ──────────────────────────────────
            await self.bus.publish_provenance(
                event_type="SPECIALIST_SPECIFIED",
                actor="gemini",
                message=f"Gemini 2.5 Pro specified specialist '{spec.name}' ({spec.id}) with {len(spec.tools)} tools.",
                payload=spec.model_dump(),
                incident_id=incident_id,
                db=db,
            )

            # ── 4. Persist Agent in Database (status=untrusted) ────────────────
            agent_record = db.query(Agent).filter(Agent.id == spec.id).first()
            if not agent_record:
                agent_record = Agent(
                    id=spec.id,
                    name=spec.name,
                    version=spec.version,
                    purpose=spec.purpose,
                    capability_ids=spec.capability_ids,
                    tools=spec.tools,
                    system_prompt=spec.system_prompt,
                    output_schema=spec.output_schema,
                    authority_status="untrusted",  # CRITICAL: Always starts untrusted
                    status="active",
                    created_by="civis-forge",
                    created_at=datetime.utcnow(),
                )
                db.add(agent_record)
            else:
                # Reset for idempotency in demo runs
                agent_record.name = spec.name
                agent_record.version = spec.version
                agent_record.purpose = spec.purpose
                agent_record.capability_ids = spec.capability_ids
                agent_record.tools = spec.tools
                agent_record.system_prompt = spec.system_prompt
                agent_record.output_schema = spec.output_schema
                agent_record.authority_status = "untrusted"
                agent_record.created_by = "civis-forge"

            db.commit()
            db.refresh(agent_record)

            # ── 5. Register in Workforce Runtime ──────────────────────────────
            # Dynamic manifest instantiation — NO code generation
            runtime_agent = AgentRuntime(
                agent_id=spec.id,
                name=spec.name,
                version=spec.version,
                purpose=spec.purpose,
                capability_ids=spec.capability_ids,
                tools=spec.tools,
                system_prompt=spec.system_prompt,
                output_schema=spec.output_schema,
                authority_status="untrusted",
                allowed_tools=[],  # Untrusted agents have NO allowed tools until authorized
                model_name=spec.model,
            )
            self.workforce.register_agent(runtime_agent)

            # ── 6. Emit SPECIALIST_CREATED ────────────────────────────────────
            await self.bus.publish_provenance(
                event_type="SPECIALIST_CREATED",
                actor="civis-forge",
                message=(
                    f"Specialist '{spec.name}' ({spec.id}) created and registered into workforce as UNTRUSTED. "
                    f"Requires evaluation before authority grant."
                ),
                payload=agent_record.to_dict(),
                incident_id=incident_id,
                db=db,
            )

            logger.info(f"[Forge] Specialist '{spec.id}' created successfully with authority_status='untrusted'.")

            return {
                "status": "created",
                "agent": agent_record.to_dict(),
                "manifest": agent_record.to_manifest(),
                "authority_status": agent_record.authority_status,
                "missing_capability": missing_capability,
                "created_by": agent_record.created_by,
            }

        finally:
            if owns_db:
                db.close()


# Global singleton
adaptation_engine = AdaptationEngine()


def get_adaptation_engine() -> AdaptationEngine:
    """Dependency / accessor for AdaptationEngine."""
    return adaptation_engine
