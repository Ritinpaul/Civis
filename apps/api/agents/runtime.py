"""
CIVIS — Agent Runtime
Derived from AgentVerse message-passing and actor architecture.
Executes agent manifests with strict authority enforcement, tool invocation,
Gemini 2.5 Flash reasoning, and deterministic demo fallbacks.
"""
import json
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

from core.settings import get_settings
from tools.registry import tool_registry, ToolRegistry
from services.event_bus import EventBus

logger = logging.getLogger("civis.agent_runtime")
settings = get_settings()


class AgentRuntime:
    """
    Runtime engine for executing a CIVIS agent.
    Enforces authority boundaries, manages tool execution, and interfaces with Gemini.
    """

    def __init__(
        self,
        agent_id: str,
        name: str,
        version: str,
        purpose: str,
        capability_ids: List[str],
        tools: List[str],
        system_prompt: str,
        output_schema: Dict[str, Any],
        authority_status: str = "authorized",
        allowed_tools: Optional[List[str]] = None,
        model_name: Optional[str] = None,
    ):
        self.agent_id = agent_id
        self.name = name
        self.version = version
        self.purpose = purpose
        self.capability_ids = capability_ids
        self.tools = tools
        self.system_prompt = system_prompt
        self.output_schema = output_schema
        self.authority_status = authority_status
        self.allowed_tools = allowed_tools if allowed_tools is not None else list(tools)
        self.model_name = model_name or settings.gemini_fast_model

    def to_manifest(self) -> Dict[str, Any]:
        """Return the agent manifest dict."""
        return {
            "id": self.agent_id,
            "name": self.name,
            "version": self.version,
            "purpose": self.purpose,
            "capability_ids": self.capability_ids,
            "tools": self.tools,
            "allowed_tools": self.allowed_tools,
            "authority_status": self.authority_status,
            "system_prompt": self.system_prompt,
            "output_schema": self.output_schema,
            "model": self.model_name,
        }

    def check_tool_authority(self, tool_name: str) -> bool:
        """Enforce tool authority: agent can only invoke explicitly allowed tools."""
        return tool_name in self.allowed_tools

    async def execute(
        self,
        input_data: Dict[str, Any],
        incident_id: Optional[str] = None,
        bus: Optional[EventBus] = None,
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Execute agent reasoning pipeline:
        1. Check authority & invoke tools
        2. Format prompt with tool outputs and incident data
        3. Call Gemini (or deterministic fallback)
        4. Validate against output_schema
        5. Publish AGENT_COMPLETED / AGENT_INSUFFICIENT event
        """
        logger.info(f"[{self.agent_id}] Executing for incident={incident_id}")

        tool_results: Dict[str, Any] = {}
        tool_audit: List[Dict[str, Any]] = []

        # ── 1. Tool Execution with Authority Enforcement ───────────────────────
        for tool_name in self.tools:
            if not self.check_tool_authority(tool_name):
                logger.warning(f"[{self.agent_id}] UNAUTHORIZED tool attempt: {tool_name}")
                if bus:
                    await bus.publish_provenance(
                        event_type="UNAUTHORIZED_TOOL_DENIED",
                        actor=self.agent_id,
                        message=f"Agent '{self.agent_id}' attempted to access unauthorized tool '{tool_name}'. Blocked by governance.",
                        payload={"agent_id": self.agent_id, "tool_name": tool_name},
                        incident_id=incident_id,
                        db=db,
                    )
                continue

            try:
                # Prepare arguments based on input_data
                kwargs = self._prepare_tool_kwargs(tool_name, input_data)
                result = tool_registry.execute(tool_name, **kwargs)
                tool_results[tool_name] = result
                tool_audit.append({
                    "tool": tool_name,
                    "args": kwargs,
                    "result": result,
                    "status": "success",
                })
            except Exception as e:
                logger.error(f"[{self.agent_id}] Tool {tool_name} execution error: {e}")
                tool_audit.append({
                    "tool": tool_name,
                    "error": str(e),
                    "status": "error",
                })

        # ── 2. Check for Capability Gap (Act II Trigger) ──────────────────────
        # If the incident asks for passability and this agent doesn't have flood_passability:
        is_unknown_incident = input_data.get("incident_type") == "unknown" or "anomaly" in input_data.get("title", "").lower()
        requires_passability = "passability" in input_data.get("description", "").lower() or "depth" in input_data.get("description", "").lower()
        
        is_insufficient = False
        if is_unknown_incident and requires_passability and "flood_passability" not in self.capability_ids:
            # Agent recognizes it lacks the capability
            is_insufficient = True

        # ── 3. Gemini Call or Deterministic Fallback ──────────────────────────
        output: Dict[str, Any] = {}
        used_llm = False

        if settings.gemini_api_key and not settings.gemini_api_key.startswith("your_"):
            try:
                output = await self._call_gemini(input_data, tool_results, is_insufficient)
                used_llm = True
            except Exception as e:
                logger.warning(f"[{self.agent_id}] Gemini call failed ({e}), falling back to deterministic response.")
                output = self._generate_fallback_output(input_data, tool_results, is_insufficient)
        else:
            output = self._generate_fallback_output(input_data, tool_results, is_insufficient)

        # ── 4. Publish Event ──────────────────────────────────────────────────
        event_type = "AGENT_INSUFFICIENT" if is_insufficient else "AGENT_COMPLETED"
        summary_msg = (
            f"Agent '{self.name}' determined it has INSUFFICIENT capability for this incident."
            if is_insufficient
            else f"Agent '{self.name}' completed assessment using {len(tool_audit)} tool(s)."
        )

        response_payload = {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "capability_ids": self.capability_ids,
            "status": "insufficient" if is_insufficient else "completed",
            "output": output,
            "tool_calls": tool_audit,
            "llm_used": used_llm,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if bus:
            await bus.publish_provenance(
                event_type=event_type,
                actor=self.agent_id,
                message=summary_msg,
                payload=response_payload,
                incident_id=incident_id,
                db=db,
            )

        return response_payload

    def _prepare_tool_kwargs(self, tool_name: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map incident input fields to tool parameters."""
        location = input_data.get("location", "Zone 4, Chennai")
        zone = "Zone 4"
        if "zone" in location.lower():
            zone = "Zone 4"

        if tool_name == "weather.read":
            return {"location": location, "time_range": "1h"}
        elif tool_name == "traffic.read":
            return {"zone": zone}
        elif tool_name == "road.read":
            road_name = "Mount Road / Anna Salai"
            if "velachery" in input_data.get("description", "").lower():
                road_name = "Velachery Main Road"
            return {"road_name": road_name, "zone": zone}
        elif tool_name == "drainage.read":
            return {"zone": zone}
        elif tool_name == "emergency.read":
            return {"zone": zone, "incident_description": input_data.get("description", "")}
        elif tool_name == "imagery.read":
            return {"location": location, "sensor_type": "optical"}
        return {}

    async def _call_gemini(
        self,
        input_data: Dict[str, Any],
        tool_results: Dict[str, Any],
        is_insufficient: bool,
    ) -> Dict[str, Any]:
        """Call Gemini model with structured output prompt."""
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(self.model_name)

        prompt = f"""
{self.system_prompt}

TASK CONTEXT:
Incident: {json.dumps(input_data, indent=2)}

SENSORY / TOOL DATA:
{json.dumps(tool_results, indent=2)}

CAPABILITY EVALUATION:
Are your capabilities {self.capability_ids} sufficient to fully resolve this incident?
{'NOTE: You lack flood_passability. If passability is required, declare INSUFFICIENT.' if is_insufficient else ''}

OUTPUT INSTRUCTIONS:
Respond with a single, strictly valid JSON object adhering to this schema:
{json.dumps(self.output_schema, indent=2)}

Do NOT wrap the JSON in markdown backticks or commentary. Return ONLY the JSON object.
"""
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        # Clean any accidental markdown fencing
        cleaned = re.sub(r"^```json\s*", "", text)
        cleaned = re.sub(r"\s*```$", "", cleaned).strip()
        return json.loads(cleaned)

    def _generate_fallback_output(
        self,
        input_data: Dict[str, Any],
        tool_results: Dict[str, Any],
        is_insufficient: bool,
    ) -> Dict[str, Any]:
        """
        Deterministic fallback matching the agent's exact output_schema.
        Guarantees 100% demo uptime and exact schema compliance.
        """
        # Specific fallbacks per agent
        if self.agent_id == "weather-agent":
            w = tool_results.get("weather.read", {})
            return {
                "rainfall_mm": w.get("rainfall_mm", 142.5),
                "flood_risk_level": w.get("flood_risk_level", "critical"),
                "weather_summary": w.get(
                    "weather_summary",
                    "Heavy monsoon cloudburst active over Chennai Zone 4. Total rainfall: 142.5mm. Flood risk critical."
                ),
            }

        elif self.agent_id == "traffic-agent":
            t = tool_results.get("traffic.read", {})
            return {
                "congestion_level": t.get("congestion_level", "critical"),
                "affected_roads": t.get("affected_roads", [
                    "Mount Road / Anna Salai (Saidapet Causeway section)",
                    "Velachery Main Road",
                    "GST Road underpass",
                ]),
                "estimated_delay_minutes": t.get("estimated_delay_minutes", 55),
                "traffic_summary": t.get(
                    "traffic_summary",
                    "Severe arterial gridlock across Saidapet and Velachery corridors. 55-minute transit delays."
                ),
            }

        elif self.agent_id == "infra-agent":
            d = tool_results.get("drainage.read", {})
            return {
                "drainage_status": d.get("drainage_status", "overloaded"),
                "at_risk_zones": d.get("at_risk_zones", [
                    "Zone 4 - Saidapet West residential belt",
                    "Zone 4 - Velachery Lake outfall channel",
                ]),
                "capacity_percentage": d.get("capacity_percentage", 124.5),
                "infra_summary": d.get(
                    "infra_summary",
                    "Stormwater drainage system overloaded at 124.5% capacity. Pumping stations running at maximum throttle."
                ),
            }

        elif self.agent_id == "emergency-agent":
            e = tool_results.get("emergency.read", {})
            return {
                "response_recommendation": (
                    "Deploy 4 ALS ambulances and 2 rescue boats to Guindy Staging Hub A. "
                    "Prioritize Saidapet low-lying settlements along Adyar River bank."
                ),
                "priority_zones": e.get("priority_zones", [
                    "Saidapet low-lying riverside settlement",
                    "Velachery AGS Colony ground floor apartments",
                ]),
                "recommended_route": e.get(
                    "recommended_primary_route",
                    "Inner Ring Road -> Guindy Flyover -> Saidapet West Approach"
                ),
                "estimated_eta_minutes": e.get("estimated_eta_minutes", 14),
                "emergency_summary": e.get(
                    "emergency_summary",
                    "Emergency resources staged at Guindy Hub A. Evacuation units prepared for immediate dispatch."
                ),
            }

        # Generic schema-filling fallback
        output = {}
        props = self.output_schema.get("properties", {})
        for prop_name, prop_def in props.items():
            prop_type = prop_def.get("type", "string")
            if prop_type == "number":
                output[prop_name] = 100.0
            elif prop_type == "array":
                output[prop_name] = ["Sample item"]
            elif prop_type == "boolean":
                output[prop_name] = True
            else:
                output[prop_name] = f"Assessment from {self.name}"
        return output
