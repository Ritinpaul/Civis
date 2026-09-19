"""
CIVIS — Emergency Agent
Pre-existing city workforce agent responsible for emergency response coordination and routing.
"""
from typing import Optional, List
from agents.runtime import AgentRuntime


class EmergencyAgent(AgentRuntime):
    """Specialized agent coordinating emergency resources, staging areas, and priority dispatch."""

    def __init__(
        self,
        authority_status: str = "authorized",
        allowed_tools: Optional[List[str]] = None,
    ):
        super().__init__(
            agent_id="emergency-agent",
            name="Emergency Coordination Agent",
            version="1.0.0",
            purpose="Coordinate emergency response resources and recommend routing.",
            capability_ids=["emergency_coordination"],
            tools=["emergency.read"],
            system_prompt=(
                "You are the Emergency Coordination Agent for Chennai's city operations center. "
                "Assess available emergency resources and recommend response priorities. "
                "Identify optimal routes for emergency vehicles. "
                "Structure response with: response_recommendation (string), priority_zones (list), "
                "recommended_route (string), estimated_eta_minutes (number), emergency_summary (string)."
            ),
            output_schema={
                "type": "object",
                "properties": {
                    "response_recommendation": {"type": "string"},
                    "priority_zones": {"type": "array", "items": {"type": "string"}},
                    "recommended_route": {"type": "string"},
                    "estimated_eta_minutes": {"type": "number"},
                    "emergency_summary": {"type": "string"},
                },
                "required": ["response_recommendation", "priority_zones", "emergency_summary"],
            },
            authority_status=authority_status,
            allowed_tools=allowed_tools or ["emergency.read"],
        )
