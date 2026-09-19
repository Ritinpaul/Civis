"""
CIVIS — Weather Agent
Pre-existing city workforce agent responsible for weather assessment and flood risk telemetry.
"""
from typing import Optional, List
from agents.runtime import AgentRuntime


class WeatherAgent(AgentRuntime):
    """Specialized agent assessing rainfall, flood risk levels, and storm progression."""

    def __init__(
        self,
        authority_status: str = "authorized",
        allowed_tools: Optional[List[str]] = None,
    ):
        super().__init__(
            agent_id="weather-agent",
            name="Weather Agent",
            version="1.0.0",
            purpose="Assess weather conditions and flood risk for city operations.",
            capability_ids=["weather_assessment"],
            tools=["weather.read"],
            system_prompt=(
                "You are the Weather Agent for Chennai's city operations center. "
                "Your role is to assess current weather conditions, rainfall data, and flood risk levels. "
                "When queried about a zone, provide specific rainfall measurements and flood risk assessment. "
                "Always structure your response with: rainfall_mm (number), flood_risk_level (low/medium/high/critical), weather_summary (string)."
            ),
            output_schema={
                "type": "object",
                "properties": {
                    "rainfall_mm": {"type": "number"},
                    "flood_risk_level": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                    "weather_summary": {"type": "string"},
                },
                "required": ["rainfall_mm", "flood_risk_level", "weather_summary"],
            },
            authority_status=authority_status,
            allowed_tools=allowed_tools or ["weather.read"],
        )
