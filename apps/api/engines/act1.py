"""
CIVIS — Act I Orchestrator: "The City Knows"
Executes the complete Act I lifecycle for INC-001 (Monsoon Waterlogging, Chennai Zone 4).

Timeline: 11 SSE Events
  1. INCIDENT_RECEIVED        — INC-001 registered
  2. GEMINI_UNDERSTANDING      — Gemini 2.5 Flash analyzes weather & hazard factors
  3. CAPABILITY_DECOMPOSITION  — Decomposes required capabilities
  4. CAPABILITY_FOUND          — All 4 capabilities verified in city registry
  5. WORKFORCE_ATTEMPTING      — Workforce of 4 agents activated
  6. AGENT_COMPLETED           — WeatherAgent evaluates rainfall & flood risk
  7. AGENT_COMPLETED           — InfrastructureAgent evaluates drainage & pumps
  8. AGENT_COMPLETED           — TrafficAgent evaluates congestion & bottlenecks
  9. AGENT_COMPLETED           — EmergencyAgent evaluates ambulances & staging
 10. SWARM_DISPATCHED          — Gemini synthesizes coordinated multi-agent response
 11. INCIDENT_RESOLVED         — INC-001 marked resolved with full provenance
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

logger = logging.getLogger("civis.act1")
settings = get_settings()

ACT1_INCIDENT_DATA = {
    "id": "INC-001",
    "title": "Monsoon Waterlogging, Chennai Zone 4",
    "description": (
        "Intense monsoon precipitation (142.5mm accumulated) causing widespread surface "
        "waterlogging along the Saidapet / Velachery corridor and Adyar River basin."
    ),
    "location": "Zone 4 (Saidapet / Velachery corridor), Chennai",
    "severity": "high",
    "incident_type": "known",
    "evidence": {
        "source": "Chennai City Operations Sensor Grid",
        "rainfall_gauge_id": "CHN-Z4-RG-02",
        "reported_depth_cm": 45.0,
        "affected_corridors": ["Mount Road", "Velachery Main Road"],
    },
}


class Act1Orchestrator:
    """Orchestrates Act I: Known problem solved by existing 4-agent city workforce."""

    def __init__(
        self,
        bus: Optional[EventBus] = None,
        intelligence: Optional[IntelligenceEngine] = None,
        delay: Optional[float] = None,
    ):
        self.bus = bus or get_event_bus()
        self.intelligence = intelligence or get_intelligence_engine()
        self.delay = delay if delay is not None else settings.demo_act1_delay

    async def _sleep(self):
        """Pacing sleep between events for real-time visualization."""
        if self.delay > 0:
            await asyncio.sleep(self.delay)

    async def run(self, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Execute the 11-event Act I sequence.
        Returns execution summary with emitted events and final resolution.
        """
        logger.info("[Act1] Starting Act I: The City Knows (INC-001)")
        owns_db = False
        if db is None:
            db = SessionLocal()
            owns_db = True

        try:
            emitted_events: List[Dict[str, Any]] = []

            # ── 1. Create or Reset Incident INC-001 ───────────────────────────
            incident = db.query(Incident).filter(Incident.id == ACT1_INCIDENT_DATA["id"]).first()
            if not incident:
                incident = Incident(
                    id=ACT1_INCIDENT_DATA["id"],
                    title=ACT1_INCIDENT_DATA["title"],
                    description=ACT1_INCIDENT_DATA["description"],
                    location=ACT1_INCIDENT_DATA["location"],
                    severity=ACT1_INCIDENT_DATA["severity"],
                    status="detected",
                    incident_type=ACT1_INCIDENT_DATA["incident_type"],
                    evidence=ACT1_INCIDENT_DATA["evidence"],
                    created_at=datetime.utcnow(),
                )
                db.add(incident)
            else:
                incident.status = "investigating"
                incident.severity = ACT1_INCIDENT_DATA["severity"]
                incident.resolved_at = None
            db.commit()
            db.refresh(incident)

            # Event 1: INCIDENT_RECEIVED
            evt1 = await self.bus.publish_provenance(
                event_type="INCIDENT_RECEIVED",
                actor="civis-system",
                message=f"Incident {incident.id} ({incident.title}) registered in {incident.location}.",
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
                message=f"Gemini analyzed incident: {understanding.summary}",
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
                message=f"Decomposed incident into {len(decomposition.required_capabilities)} required capabilities.",
                payload=decomposition.model_dump(),
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt3)
            await self._sleep()

            # ── 4. Capability Found ───────────────────────────────────────────
            found_ids = [rc.id for rc in decomposition.required_capabilities if rc.is_available]
            evt4 = await self.bus.publish_provenance(
                event_type="CAPABILITY_FOUND",
                actor="capability-registry",
                message=f"All {len(found_ids)} required capabilities verified in city registry: {', '.join(found_ids)}.",
                payload={
                    "incident_id": incident.id,
                    "verified_capabilities": found_ids,
                    "has_gap": False,
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
                message=f"Workforce of {len(active_agents)} agents activated for {incident.id}.",
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
                "event_type": "AGENT_COMPLETED",
                "actor": "weather-agent",
                "payload": w_res,
            })
            await self._sleep()

            # ── 7. InfrastructureAgent Execution ──────────────────────────────
            infra_agent = InfrastructureAgent()
            i_res = await infra_agent.execute(incident.to_dict(), incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "infra-agent",
                "payload": i_res,
            })
            await self._sleep()

            # ── 8. TrafficAgent Execution ─────────────────────────────────────
            traffic_agent = TrafficAgent()
            t_res = await traffic_agent.execute(incident.to_dict(), incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "traffic-agent",
                "payload": t_res,
            })
            await self._sleep()

            # ── 9. EmergencyAgent Execution ───────────────────────────────────
            emergency_agent = EmergencyAgent()
            e_res = await emergency_agent.execute(incident.to_dict(), incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "emergency-agent",
                "payload": e_res,
            })
            await self._sleep()

            # ── 10. Swarm Coordination (Job 7) ────────────────────────────────
            agent_outputs = [w_res, i_res, t_res, e_res]
            swarm = await self.intelligence.coordinate_swarm(incident.to_dict(), agent_outputs)
            evt10 = await self.bus.publish_provenance(
                event_type="SWARM_DISPATCHED",
                actor="gemini",
                message=f"Swarm coordinated across {len(active_agents)} agents. Staging Hub: {swarm.priority_staging_area}.",
                payload=swarm.model_dump(),
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt10)
            await self._sleep()

            # ── 11. Incident Resolved ─────────────────────────────────────────
            incident.status = "resolved"
            incident.resolved_at = datetime.utcnow()
            db.commit()
            db.refresh(incident)

            evt11 = await self.bus.publish_provenance(
                event_type="INCIDENT_RESOLVED",
                actor="civis-system",
                message=f"INC-001 resolved successfully by 4-agent city workforce. Est. resolution: {swarm.estimated_resolution_time_minutes} mins.",
                payload={
                    "incident_id": incident.id,
                    "status": "resolved",
                    "resolved_at": incident.resolved_at.isoformat(),
                    "resolution_summary": swarm.synthesized_action_plan,
                },
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt11)

            logger.info(f"[Act1] Completed Act I with {len(emitted_events)} events.")
            return {
                "act": "I",
                "incident_id": incident.id,
                "status": "resolved",
                "event_count": len(emitted_events),
                "agents_involved": active_agents,
                "swarm_coordination": swarm.model_dump(),
                "resolved_at": incident.resolved_at.isoformat(),
            }

        finally:
            if owns_db:
                db.close()


# Global singleton
act1_orchestrator = Act1Orchestrator()


def get_act1_orchestrator() -> Act1Orchestrator:
    """Dependency / accessor for Act1Orchestrator."""
    return act1_orchestrator
