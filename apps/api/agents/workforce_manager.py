"""
CIVIS — Workforce Manager
Orchestrates agent instances, coordinates message passing, and manages multi-agent swarms.
"""
import logging
from typing import Dict, List, Optional, Any
from agents.runtime import AgentRuntime
from agents.weather import WeatherAgent
from agents.traffic import TrafficAgent
from agents.infrastructure import InfrastructureAgent
from agents.emergency import EmergencyAgent
from services.event_bus import EventBus

logger = logging.getLogger("civis.workforce")


class WorkforceManager:
    """Manages the active roster of agents in the city workforce."""

    def __init__(self):
        self._agents: Dict[str, AgentRuntime] = {}
        self._register_base_workforce()

    def _register_base_workforce(self):
        """Register the 4 pre-existing base city agents."""
        base_agents = [
            WeatherAgent(),
            TrafficAgent(),
            InfrastructureAgent(),
            EmergencyAgent(),
        ]
        for agent in base_agents:
            self.register_agent(agent)

    def register_agent(self, agent: AgentRuntime):
        """Register an agent into the operational workforce."""
        self._agents[agent.agent_id] = agent
        logger.info(f"[WorkforceManager] Registered agent: {agent.agent_id} ({agent.name})")

    def get_agent(self, agent_id: str) -> Optional[AgentRuntime]:
        """Get an agent by its ID."""
        return self._agents.get(agent_id)

    def list_agents(self) -> List[AgentRuntime]:
        """List all currently registered agents."""
        return list(self._agents.values())

    async def dispatch_agent(
        self,
        agent_id: str,
        incident: Dict[str, Any],
        bus: Optional[EventBus] = None,
    ) -> Dict[str, Any]:
        """Dispatch a single agent to assess an incident."""
        agent = self.get_agent(agent_id)
        if not agent:
            raise KeyError(f"Agent '{agent_id}' not found in workforce")
        return await agent.execute(input_data=incident, incident_id=incident.get("id"), bus=bus)

    async def dispatch_workforce(
        self,
        incident: Dict[str, Any],
        bus: Optional[EventBus] = None,
        agent_order: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Dispatch the workforce to assess and resolve an incident.
        Emits WORKFORCE_ATTEMPTING provenance event.
        Executes agents sequentially (or in specified coordination order).
        """
        incident_id = incident.get("id", "INC-UNKNOWN")
        logger.info(f"[WorkforceManager] Dispatching workforce for incident={incident_id}")

        if bus:
            await bus.publish_provenance(
                event_type="WORKFORCE_ATTEMPTING",
                actor="workforce-manager",
                message=f"Workforce of {len(self._agents)} agents activated for {incident_id}.",
                payload={"incident_id": incident_id, "active_agents": list(self._agents.keys())},
                incident_id=incident_id,
            )

        # Standard coordination order
        order = agent_order or ["weather-agent", "infra-agent", "traffic-agent", "emergency-agent"]
        results: List[Dict[str, Any]] = []

        for aid in order:
            agent = self.get_agent(aid)
            if agent:
                res = await agent.execute(input_data=incident, incident_id=incident_id, bus=bus)
                results.append(res)

        return results


# Global singleton
workforce_manager = WorkforceManager()


def get_workforce_manager() -> WorkforceManager:
    """Dependency / accessor for WorkforceManager."""
    return workforce_manager
