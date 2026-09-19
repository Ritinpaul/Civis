"""
CIVIS — Act II Orchestrator: "The City Doesn't Know"
Executes the Act II lifecycle for INC-002 (Unknown Road Accessibility Anomaly).

Core Story:
  The city encounters a problem its existing workforce cannot solve.
  Workforce attempts but cannot resolve. Capability gap is identified (the hero moment).

Timeline:
  1. INCIDENT_RECEIVED        — INC-002 registered (critical unknown anomaly)
  2. GEMINI_UNDERSTANDING      — Gemini 2.5 Flash analyzes anomaly, flags unknown pattern
  3. CAPABILITY_DECOMPOSITION  — Decomposes required capabilities, flags flood_passability
  4. CAPABILITY_GAP            — Registry search fails: flood_passability NOT FOUND (Hero moment)
  5. WORKFORCE_ATTEMPTING      — Existing 4-agent workforce attempts assessment
  6. AGENT_INSUFFICIENT        — WeatherAgent insufficient for passability
  7. AGENT_INSUFFICIENT        — InfrastructureAgent insufficient for passability
  8. AGENT_INSUFFICIENT        — TrafficAgent insufficient for passability
  9. AGENT_INSUFFICIENT        — EmergencyAgent declares INSUFFICIENT (critical ambulance risk)
"""
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from core.settings import get_settings
from core.database import SessionLocal
from models.incident import Incident
from models.capability import Capability
from services.event_bus import get_event_bus, EventBus
from engines.intelligence import get_intelligence_engine, IntelligenceEngine
from agents.weather import WeatherAgent
from agents.traffic import TrafficAgent
from agents.infrastructure import InfrastructureAgent
from agents.emergency import EmergencyAgent

logger = logging.getLogger("civis.act2")
settings = get_settings()

ACT2_INCIDENT_DATA = {
    "id": "INC-002",
    "title": "Unknown Road Accessibility Anomaly",
    "description": (
        "Submerged arterial causeway along Saidapet corridor with unknown standing water depth, "
        "rapid Adyar river outflow currents, and suspected submerged roadbed damage. "
        "Ambulances cannot determine if route is passable without stalling or capsizing."
    ),
    "location": "Saidapet Causeway, Chennai Zone 4",
    "severity": "critical",
    "incident_type": "unknown",
    "evidence": {
        "source": "Emergency Dispatch Unit 4 & CCTV Node CHN-Z4-CAM-18",
        "standing_water_detected": True,
        "turbidity": "high",
        "standard_vehicles_stalled": 3,
        "required_determination": "dynamic_depth_passability",
    },
}


class Act2Orchestrator:
    """Orchestrates Act II: Unknown problem triggers capability gap & workforce insufficiency."""

    def __init__(
        self,
        bus: Optional[EventBus] = None,
        intelligence: Optional[IntelligenceEngine] = None,
        delay: Optional[float] = None,
    ):
        self.bus = bus or get_event_bus()
        self.intelligence = intelligence or get_intelligence_engine()
        self.delay = delay if delay is not None else settings.demo_act2_delay

    async def _sleep(self):
        """Pacing sleep between events for real-time visualization."""
        if self.delay > 0:
            await asyncio.sleep(self.delay)

    async def run(
        self,
        db: Optional[Session] = None,
        auto_forge: bool = False,
    ) -> Dict[str, Any]:
        """
        Execute the Act II sequence.
        Returns summary with emitted events, capability gap details, and agent insufficiency.
        If auto_forge=True, seamlessly transitions into Phase 8 (Forge).
        """
        logger.info("[Act2] Starting Act II: The City Doesn't Know (INC-002)")
        owns_db = False
        if db is None:
            db = SessionLocal()
            owns_db = True

        try:
            emitted_events: List[Dict[str, Any]] = []

            # ── 1. Create or Reset Incident INC-002 ───────────────────────────
            incident = db.query(Incident).filter(Incident.id == ACT2_INCIDENT_DATA["id"]).first()
            if not incident:
                incident = Incident(
                    id=ACT2_INCIDENT_DATA["id"],
                    title=ACT2_INCIDENT_DATA["title"],
                    description=ACT2_INCIDENT_DATA["description"],
                    location=ACT2_INCIDENT_DATA["location"],
                    severity=ACT2_INCIDENT_DATA["severity"],
                    status="investigating",
                    incident_type=ACT2_INCIDENT_DATA["incident_type"],
                    evidence=ACT2_INCIDENT_DATA["evidence"],
                    created_at=datetime.utcnow(),
                )
                db.add(incident)
            else:
                incident.status = "investigating"
                incident.severity = ACT2_INCIDENT_DATA["severity"]
                incident.incident_type = "unknown"
                incident.resolved_at = None
            db.commit()
            db.refresh(incident)

            # Event 1: INCIDENT_RECEIVED
            evt1 = await self.bus.publish_provenance(
                event_type="INCIDENT_RECEIVED",
                actor="civis-system",
                message=f"Incident {incident.id} ({incident.title}) registered in {incident.location}. Type: UNKNOWN.",
                payload=incident.to_dict(),
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt1)
            await self._sleep()

            # ── 2. Gemini Understanding (Job 1) ───────────────────────────────
            understanding = await self.intelligence.understand_incident(incident.to_dict())
            evt2 = await self.bus.publish_provenance(
                event_type="GEMINI_UNDERSTANDING",
                actor="gemini",
                message=f"Gemini analyzed anomaly: {understanding.summary} (Known Pattern: {understanding.is_known_pattern}).",
                payload=understanding.model_dump(),
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt2)
            await self._sleep()

            # ── 3. Capability Decomposition (Job 2) ───────────────────────────
            registered_caps = db.query(Capability).filter(Capability.status == "verified").all()
            caps_dicts = [c.to_dict() for c in registered_caps]

            decomposition = await self.intelligence.decompose_capabilities(
                incident=incident.to_dict(),
                registered_capabilities=caps_dicts,
            )
            evt3 = await self.bus.publish_provenance(
                event_type="CAPABILITY_DECOMPOSITION",
                actor="gemini",
                message=f"Capability decomposition complete. Gap detected: {decomposition.has_gap}. Missing: {decomposition.missing_capabilities}.",
                payload=decomposition.model_dump(),
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt3)
            await self._sleep()

            # ── 4. Capability Gap (The Hero Moment) ───────────────────────────
            missing_caps = decomposition.missing_capabilities or ["flood_passability"]
            evt4 = await self.bus.publish_provenance(
                event_type="CAPABILITY_GAP",
                actor="capability-registry",
                message=(
                    f"CAPABILITY GAP IDENTIFIED: City intelligence lacks capability '{', '.join(missing_caps)}' "
                    f"to calculate dynamic road passability for {incident.id}."
                ),
                payload={
                    "incident_id": incident.id,
                    "missing_capabilities": missing_caps,
                    "gap_detected": True,
                    "suggested_action": "TRIGGER_ADAPTATION_ENGINE",
                },
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt4)
            await self._sleep()

            # ── 5. Workforce Attempting ───────────────────────────────────────
            active_agents = ["weather-agent", "infra-agent", "traffic-agent", "emergency-agent"]
            evt5 = await self.bus.publish_provenance(
                event_type="WORKFORCE_ATTEMPTING",
                actor="workforce-manager",
                message=f"Workforce of {len(active_agents)} agents attempting resolution for {incident.id}...",
                payload={
                    "incident_id": incident.id,
                    "active_agents": active_agents,
                },
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt5)
            await self._sleep()

            # ── 6. WeatherAgent Execution ─────────────────────────────────────
            weather_agent = WeatherAgent()
            w_res = await weather_agent.execute(incident.to_dict(), incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": w_res.get("status", "completed"),
                "actor": "weather-agent",
                "payload": w_res,
            })
            await self._sleep()

            # ── 7. InfrastructureAgent Execution ──────────────────────────────
            infra_agent = InfrastructureAgent()
            i_res = await infra_agent.execute(incident.to_dict(), incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": i_res.get("status", "completed"),
                "actor": "infra-agent",
                "payload": i_res,
            })
            await self._sleep()

            # ── 8. TrafficAgent Execution ─────────────────────────────────────
            traffic_agent = TrafficAgent()
            t_res = await traffic_agent.execute(incident.to_dict(), incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": t_res.get("status", "completed"),
                "actor": "traffic-agent",
                "payload": t_res,
            })
            await self._sleep()

            # ── 9. EmergencyAgent Execution (Declares INSUFFICIENT) ────────────
            emergency_agent = EmergencyAgent()
            e_res = await emergency_agent.execute(incident.to_dict(), incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_INSUFFICIENT",
                "actor": "emergency-agent",
                "payload": e_res,
            })
            await self._sleep()

            # Optional: auto_forge seamlessly triggers Phase 8
            forge_result = None
            if auto_forge:
                from engines.adaptation import get_adaptation_engine
                adaptation = get_adaptation_engine()
                forge_result = await adaptation.forge_specialist(
                    missing_capability=missing_caps[0],
                    incident_id=incident.id,
                    incident=incident.to_dict(),
                    db=db,
                )

            logger.info(f"[Act2] Completed Act II: Gap identified and workforce declared insufficient.")
            return {
                "act": "II",
                "incident_id": incident.id,
                "status": "capability_gap_detected",
                "event_count": len(emitted_events),
                "gap_detected": True,
                "missing_capabilities": missing_caps,
                "workforce_status": "insufficient",
                "auto_forge_triggered": auto_forge,
                "forge_result": forge_result,
            }

        finally:
            if owns_db:
                db.close()


# Global singleton
act2_orchestrator = Act2Orchestrator()


def get_act2_orchestrator() -> Act2Orchestrator:
    """Dependency / accessor for Act2Orchestrator."""
    return act2_orchestrator
