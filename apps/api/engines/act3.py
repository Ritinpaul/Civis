"""
CIVIS — Act III Orchestrator: "The City Adapts — Multi-Agent Swarm" (Phase 13)
Coordinates the 5-agent city workforce (including the newly verified Passage Agent)
via Gemini 2.5 Flash to resolve INC-002 (Road Accessibility Anomaly).

Execution Sequence:
  1. WeatherAgent        — Evaluates storm intensity and rain volume
  2. InfrastructureAgent — Evaluates drainage overflow & pump stress
  3. PassageAgent        — Specialist calculates water depth (48cm) & flow rate (1.8m/s) -> IMPASSABLE
  4. TrafficAgent        — Consumes passage finding; routes civilian traffic to Anna Salai flyover
  5. EmergencyAgent      — Consumes passage & traffic findings; dispatches amphibious rescue unit
  6. Gemini 2.5 Flash    — Job 7 synthesizes unified multi-hazard city action plan
  7. INCIDENT_RESOLVED   — INC-002 marked resolved with complete provenance trail
"""
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from core.settings import get_settings
from core.database import SessionLocal
from models.incident import Incident
from models.agent import Agent
from services.event_bus import get_event_bus, EventBus
from engines.intelligence import get_intelligence_engine, IntelligenceEngine
from agents.weather import WeatherAgent
from agents.traffic import TrafficAgent
from agents.infrastructure import InfrastructureAgent
from agents.emergency import EmergencyAgent
from agents.runtime import GenericAgentRuntime
from agents.workforce_manager import get_workforce_manager, WorkforceManager
from engines.act2 import ACT2_INCIDENT_DATA

logger = logging.getLogger("civis.act3")
settings = get_settings()


class Act3Orchestrator:
    """Orchestrates Act III: 5-agent swarm coordination to resolve INC-002."""

    def __init__(
        self,
        bus: Optional[EventBus] = None,
        intelligence: Optional[IntelligenceEngine] = None,
        workforce: Optional[WorkforceManager] = None,
        delay: Optional[float] = None,
    ):
        self.bus = bus or get_event_bus()
        self.intelligence = intelligence or get_intelligence_engine()
        self.workforce = workforce or get_workforce_manager()
        self.delay = delay if delay is not None else settings.demo_act2_delay

    async def _sleep(self):
        """Pacing sleep between events for real-time visualization."""
        if self.delay > 0:
            await asyncio.sleep(self.delay)

    def get_flow_graph(self) -> Dict[str, Any]:
        """
        Generate React Flow graph data (nodes & edges) for Screen 6.
        Visualizes the 5-agent workforce with the newly integrated Passage Agent.
        """
        nodes = [
            {
                "id": "weather-agent",
                "type": "agentNode",
                "position": {"x": 50, "y": 150},
                "data": {
                    "label": "Weather Agent",
                    "role": "Meteorological Sensing",
                    "capability": "weather_assessment",
                    "status": "completed",
                    "isSpecialist": False,
                    "allowedTools": ["weather.read"],
                },
            },
            {
                "id": "infra-agent",
                "type": "agentNode",
                "position": {"x": 280, "y": 150},
                "data": {
                    "label": "Infrastructure Agent",
                    "role": "Drainage & Pump Monitoring",
                    "capability": "infrastructure_monitoring",
                    "status": "completed",
                    "isSpecialist": False,
                    "allowedTools": ["drainage.read"],
                },
            },
            {
                "id": "passage-agent",
                "type": "specialistNode",
                "position": {"x": 520, "y": 80},
                "data": {
                    "label": "Passage Agent",
                    "role": "Dynamic Flood Passability Specialist",
                    "capability": "flood_passability",
                    "status": "verified",
                    "isSpecialist": True,
                    "authority": "limited",
                    "allowedTools": ["road.read", "weather.read", "imagery.read"],
                    "deniedTools": ["citizen.read", "traffic.write", "emergency.dispatch"],
                },
            },
            {
                "id": "traffic-agent",
                "type": "agentNode",
                "position": {"x": 780, "y": 80},
                "data": {
                    "label": "Traffic Agent",
                    "role": "Corridor Rerouting",
                    "capability": "traffic_monitoring",
                    "status": "completed",
                    "isSpecialist": False,
                    "allowedTools": ["traffic.read", "road.read"],
                },
            },
            {
                "id": "emergency-agent",
                "type": "agentNode",
                "position": {"x": 1020, "y": 150},
                "data": {
                    "label": "Emergency Coordination Agent",
                    "role": "Asset Staging & Dispatch",
                    "capability": "emergency_coordination",
                    "status": "completed",
                    "isSpecialist": False,
                    "allowedTools": ["emergency.read"],
                },
            },
        ]

        edges = [
            {
                "id": "edge-weather-infra",
                "source": "weather-agent",
                "target": "infra-agent",
                "animated": True,
                "label": "Rainfall Volume (142.5mm)",
            },
            {
                "id": "edge-infra-passage",
                "source": "infra-agent",
                "target": "passage-agent",
                "animated": True,
                "label": "Canal Overflow & Backflow",
            },
            {
                "id": "edge-passage-traffic",
                "source": "passage-agent",
                "target": "traffic-agent",
                "animated": True,
                "label": "Causeway Impassable (48cm)",
            },
            {
                "id": "edge-passage-emergency",
                "source": "passage-agent",
                "target": "emergency-agent",
                "animated": True,
                "label": "Amphibious Vehicle Clearance Req",
            },
            {
                "id": "edge-traffic-emergency",
                "source": "traffic-agent",
                "target": "emergency-agent",
                "animated": True,
                "label": "Anna Salai Flyover Clear",
            },
        ]

        return {"nodes": nodes, "edges": edges}

    async def run(
        self,
        incident_id: str = "INC-002",
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """
        Execute the 5-agent swarm coordination sequence for INC-002.
        Returns execution summary with emitted events and unified swarm action plan.
        """
        logger.info(f"[Act3] Starting Act III: Multi-Agent Swarm for {incident_id}")
        owns_db = False
        if db is None:
            db = SessionLocal()
            owns_db = True

        try:
            emitted_events: List[Dict[str, Any]] = []

            # ── 1. Retrieve or Initialize Incident ────────────────────────────
            incident = db.query(Incident).filter(Incident.id == incident_id).first()
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
                db.commit()
                db.refresh(incident)

            incident_dict = incident.to_dict()
            active_agents = [
                "weather-agent",
                "infra-agent",
                "passage-agent",
                "traffic-agent",
                "emergency-agent",
            ]

            # Event 1: SWARM_STARTED
            evt1 = await self.bus.publish_provenance(
                event_type="SWARM_STARTED",
                actor="civis-system",
                message=f"Act III: 5-Agent swarm mobilized for incident {incident.id} ({incident.title}).",
                payload={
                    "incident_id": incident.id,
                    "active_agents": active_agents,
                    "coordination_topology": "sequential_reactive_mesh",
                },
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt1)
            await self._sleep()

            # ── 2. WeatherAgent Execution ─────────────────────────────────────
            await self.bus.publish_provenance(
                event_type="AGENT_TASK_DISPATCHED",
                actor="weather-agent",
                message="Weather Agent analyzing regional storm radar and precipitation levels.",
                payload={"step": 1, "agent_id": "weather-agent"},
                incident_id=incident.id,
                db=db,
            )
            weather_agent = WeatherAgent()
            w_res = await weather_agent.execute(incident_dict, incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "weather-agent",
                "payload": w_res,
            })
            await self._sleep()

            # ── 3. InfrastructureAgent Execution ──────────────────────────────
            await self.bus.publish_provenance(
                event_type="AGENT_TASK_DISPATCHED",
                actor="infra-agent",
                message="Infrastructure Agent evaluating Saidapet drainage network and pump stations.",
                payload={"step": 2, "agent_id": "infra-agent"},
                incident_id=incident.id,
                db=db,
            )
            infra_agent = InfrastructureAgent()
            i_res = await infra_agent.execute(incident_dict, incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "infra-agent",
                "payload": i_res,
            })
            await self._sleep()

            # ── 4. PassageAgent (Specialist) Execution ─────────────────────────
            await self.bus.publish_provenance(
                event_type="AGENT_TASK_DISPATCHED",
                actor="passage-agent",
                message="Specialist Passage Agent computing hydrodynamic depth & vehicle passability.",
                payload={"step": 3, "agent_id": "passage-agent", "is_specialist": True},
                incident_id=incident.id,
                db=db,
            )

            # Retrieve or instantiate PassageAgent runtime
            passage_runtime = self.workforce.get_agent("passage-agent")
            if not passage_runtime:
                agent_model = db.query(Agent).filter(Agent.id == "passage-agent").first()
                if agent_model:
                    passage_runtime = GenericAgentRuntime.from_manifest(agent_model, db=db)
                    self.workforce.register_agent(passage_runtime)
                else:
                    # Fallback default specialist runtime
                    passage_runtime = GenericAgentRuntime(
                        agent_id="passage-agent",
                        name="Passage Agent",
                        version="1.1.0",
                        purpose="Dynamic flood passability evaluation",
                        capability_ids=["flood_passability"],
                        tools=["road.read", "weather.read", "imagery.read"],
                        system_prompt=(
                            "Assess road passability based on water depth, flow speed, and vehicle clearance. "
                            "Output JSON with is_passable, passability_status (PASSABLE/IMPASSABLE/UNKNOWN), "
                            "water_depth_cm, flow_velocity_ms, and route_recommendation."
                        ),
                        output_schema={
                            "type": "object",
                            "properties": {
                                "is_passable": {"type": "boolean"},
                                "passability_status": {"type": "string"},
                                "water_depth_cm": {"type": "number"},
                                "flow_velocity_ms": {"type": "number"},
                                "route_recommendation": {"type": "string"},
                            },
                        },
                        authority_status="authorized",
                        allowed_tools=["road.read", "weather.read", "imagery.read"],
                    )
                    self.workforce.register_agent(passage_runtime)

            passage_input = {
                **incident_dict,
                "weather_context": w_res,
                "infra_context": i_res,
                "standing_water_cm": 48.0,
                "current_velocity_ms": 1.8,
            }
            p_res = await passage_runtime.execute(passage_input, incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "passage-agent",
                "payload": p_res,
            })
            await self._sleep()

            # ── 5. TrafficAgent Execution (Reactive to Passage) ───────────────
            await self.bus.publish_provenance(
                event_type="AGENT_TASK_DISPATCHED",
                actor="traffic-agent",
                message="Traffic Agent calculating diversions based on Passage Agent IMPASSABLE finding.",
                payload={"step": 4, "agent_id": "traffic-agent"},
                incident_id=incident.id,
                db=db,
            )
            traffic_input = {
                **incident_dict,
                "passage_assessment": p_res,
                "causeway_passable": False,
                "blockage_point": "Saidapet Causeway",
            }
            traffic_agent = TrafficAgent()
            t_res = await traffic_agent.execute(traffic_input, incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "traffic-agent",
                "payload": t_res,
            })
            await self._sleep()

            # ── 6. EmergencyAgent Execution (Reactive to Passage + Traffic) ───
            await self.bus.publish_provenance(
                event_type="AGENT_TASK_DISPATCHED",
                actor="emergency-agent",
                message="Emergency Agent dispatching amphibious rescue asset via verified corridor.",
                payload={"step": 5, "agent_id": "emergency-agent"},
                incident_id=incident.id,
                db=db,
            )
            emergency_input = {
                **incident_dict,
                "passage_assessment": p_res,
                "traffic_diversions": t_res,
                "required_vehicle_type": "high_clearance_amphibious",
            }
            emergency_agent = EmergencyAgent()
            e_res = await emergency_agent.execute(emergency_input, incident_id=incident.id, bus=self.bus, db=db)
            emitted_events.append({
                "event_type": "AGENT_COMPLETED",
                "actor": "emergency-agent",
                "payload": e_res,
            })
            await self._sleep()

            # ── 7. Swarm Coordination (Job 7) ────────────────────────────────
            agent_outputs = [w_res, i_res, p_res, t_res, e_res]
            swarm = await self.intelligence.coordinate_swarm(incident.to_dict(), agent_outputs)
            evt7 = await self.bus.publish_provenance(
                event_type="SWARM_COORDINATED",
                actor="gemini",
                message=f"Swarm coordinated across all 5 agents (including specialist Passage Agent). Staging Hub: {swarm.priority_staging_area}.",
                payload=swarm.model_dump(),
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt7)
            await self._sleep()

            # ── 8. Incident Resolved ─────────────────────────────────────────
            incident.status = "resolved"
            incident.resolved_at = datetime.utcnow()
            db.commit()
            db.refresh(incident)

            evt8 = await self.bus.publish_provenance(
                event_type="INCIDENT_RESOLVED",
                actor="civis-system",
                message=(
                    f"INC-002 resolved successfully by adapted 5-agent city workforce. "
                    f"Est. resolution: {swarm.estimated_resolution_time_minutes} mins."
                ),
                payload={
                    "incident_id": incident.id,
                    "status": "resolved",
                    "resolved_at": incident.resolved_at.isoformat(),
                    "resolution_summary": swarm.synthesized_action_plan,
                    "agents_involved": active_agents,
                },
                incident_id=incident.id,
                db=db,
            )
            emitted_events.append(evt8)

            logger.info(f"[Act3] Completed Act III with {len(emitted_events)} events.")
            return {
                "act": "III",
                "incident_id": incident.id,
                "status": "resolved",
                "event_count": len(emitted_events),
                "agents_involved": active_agents,
                "swarm_coordination": swarm.model_dump(),
                "flow_graph": self.get_flow_graph(),
                "resolved_at": incident.resolved_at.isoformat(),
            }

        finally:
            if owns_db:
                db.close()


# Global singleton
act3_orchestrator = Act3Orchestrator()


def get_act3_orchestrator() -> Act3Orchestrator:
    """Dependency / accessor for Act3Orchestrator."""
    return act3_orchestrator
