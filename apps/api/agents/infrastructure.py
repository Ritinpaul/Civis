"""
CIVIS — Infrastructure Agent
Pre-existing city workforce agent responsible for drainage, pumping, and flood infrastructure.
"""
from typing import Optional, List
from agents.runtime import AgentRuntime


class InfrastructureAgent(AgentRuntime):
    """Specialized agent monitoring stormwater drainage networks, canals, and pumping stations."""

    def __init__(
        self,
        authority_status: str = "authorized",
        allowed_tools: Optional[List[str]] = None,
    ):
        super().__init__(
            agent_id="infra-agent",
            name="Infrastructure Agent",
            version="1.0.0",
            purpose="Monitor drainage, pumping stations, and flood-prone infrastructure.",
            capability_ids=["infrastructure_monitoring"],
            tools=["drainage.read"],
            system_prompt=(
                "You are the Infrastructure Agent for Chennai's city operations center. "
                "Assess drainage system capacity, identify overloaded zones, and flag infrastructure at risk. "
                "Structure response with: drainage_status (operational/strained/overloaded/failed), "
                "at_risk_zones (list), capacity_percentage (number 0-100), infra_summary (string)."
            ),
            output_schema={
                "type": "object",
                "properties": {
                    "drainage_status": {"type": "string", "enum": ["operational", "strained", "overloaded", "failed"]},
                    "at_risk_zones": {"type": "array", "items": {"type": "string"}},
                    "capacity_percentage": {"type": "number"},
                    "infra_summary": {"type": "string"},
                },
                "required": ["drainage_status", "at_risk_zones", "infra_summary"],
            },
            authority_status=authority_status,
            allowed_tools=allowed_tools or ["drainage.read"],
        )
