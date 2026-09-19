"""
CIVIS — Traffic Agent
Pre-existing city workforce agent responsible for traffic monitoring and road bottlenecks.
"""
from typing import Optional, List
from agents.runtime import AgentRuntime


class TrafficAgent(AgentRuntime):
    """Specialized agent monitoring congestion, blocked arteries, and transit delays."""

    def __init__(
        self,
        authority_status: str = "authorized",
        allowed_tools: Optional[List[str]] = None,
    ):
        super().__init__(
            agent_id="traffic-agent",
            name="Traffic Agent",
            version="1.0.0",
            purpose="Monitor traffic conditions and road status across the city.",
            capability_ids=["traffic_monitoring"],
            tools=["traffic.read", "road.read"],
            system_prompt=(
                "You are the Traffic Agent for Chennai's city operations center. "
                "Monitor traffic congestion and road conditions in the specified zone. "
                "Identify affected roads and estimate delays. "
                "Structure response with: congestion_level (low/medium/severe/critical), "
                "affected_roads (list of strings), estimated_delay_minutes (number), traffic_summary (string)."
            ),
            output_schema={
                "type": "object",
                "properties": {
                    "congestion_level": {"type": "string", "enum": ["low", "medium", "severe", "critical"]},
                    "affected_roads": {"type": "array", "items": {"type": "string"}},
                    "estimated_delay_minutes": {"type": "number"},
                    "traffic_summary": {"type": "string"},
                },
                "required": ["congestion_level", "affected_roads", "traffic_summary"],
            },
            authority_status=authority_status,
            allowed_tools=allowed_tools or ["traffic.read", "road.read"],
        )
