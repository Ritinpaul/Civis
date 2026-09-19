"""
CIVIS — Database Seed Script
Run after `alembic upgrade head`.

Seeds:
  - 4 base capabilities (pre-existing city knowledge)
  - 4 base agents  (pre-existing city workforce)
  - Authority records for each agent (what tools they can use)
  - One initial WorkforceSnapshot

NOTE: flood_passability is deliberately NOT seeded — its absence
is what triggers the adaptation engine in Act II.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models import Agent, Capability, Authority, WorkforceSnapshot

# ─────────────────────────────────────────────────────────────────────────────
# Base Capabilities — what the city already knows
# ─────────────────────────────────────────────────────────────────────────────
SEED_CAPABILITIES = [
    {
        "id": "weather_assessment",
        "name": "Weather & Flood Risk Assessment",
        "purpose": "Assess current rainfall, flood risk levels, and weather conditions affecting the city.",
        "inputs": ["location", "time_range"],
        "outputs": ["rainfall_mm", "flood_risk_level", "weather_summary"],
        "required_tools": ["weather.read"],
        "version": "1.0.0",
        "status": "verified",
    },
    {
        "id": "traffic_monitoring",
        "name": "Traffic & Road Status Monitoring",
        "purpose": "Monitor traffic congestion, road blockages, and affected routes.",
        "inputs": ["zone", "time_range"],
        "outputs": ["congestion_level", "affected_roads", "estimated_delays"],
        "required_tools": ["traffic.read", "road.read"],
        "version": "1.0.0",
        "status": "verified",
    },
    {
        "id": "infrastructure_monitoring",
        "name": "City Infrastructure Monitoring",
        "purpose": "Monitor drainage systems, pumping stations, and flood-prone zones.",
        "inputs": ["zone"],
        "outputs": ["drainage_status", "at_risk_zones", "capacity_percentage"],
        "required_tools": ["drainage.read"],
        "version": "1.0.0",
        "status": "verified",
    },
    {
        "id": "emergency_coordination",
        "name": "Emergency Response Coordination",
        "purpose": "Coordinate emergency resources and recommend response priorities.",
        "inputs": ["incident_description", "available_resources"],
        "outputs": ["response_recommendation", "priority_zones", "estimated_eta"],
        "required_tools": ["emergency.read"],
        "version": "1.0.0",
        "status": "verified",
    },
    # NOTE: flood_passability is NOT seeded here.
    # Its absence is the trigger for Act II's capability gap.
]

# ─────────────────────────────────────────────────────────────────────────────
# Base Agents — the pre-existing city workforce
# ─────────────────────────────────────────────────────────────────────────────
SEED_AGENTS = [
    {
        "id": "weather-agent",
        "name": "Weather Agent",
        "version": "1.0.0",
        "purpose": "Assess weather conditions and flood risk for city operations.",
        "capability_ids": ["weather_assessment"],
        "tools": ["weather.read"],
        "system_prompt": (
            "You are the Weather Agent for Chennai's city operations center. "
            "Your role is to assess current weather conditions, rainfall data, and flood risk levels. "
            "When queried about a zone, provide specific rainfall measurements and flood risk assessment. "
            "Always structure your response with: rainfall_mm (number), flood_risk_level (low/medium/high/critical), weather_summary (string)."
        ),
        "output_schema": {
            "type": "object",
            "properties": {
                "rainfall_mm": {"type": "number"},
                "flood_risk_level": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                "weather_summary": {"type": "string"},
            },
            "required": ["rainfall_mm", "flood_risk_level", "weather_summary"],
        },
        "authority_status": "authorized",
        "status": "active",
        "created_by": "system",
        "allowed_tools": ["weather.read"],
    },
    {
        "id": "traffic-agent",
        "name": "Traffic Agent",
        "version": "1.0.0",
        "purpose": "Monitor traffic conditions and road status across the city.",
        "capability_ids": ["traffic_monitoring"],
        "tools": ["traffic.read", "road.read"],
        "system_prompt": (
            "You are the Traffic Agent for Chennai's city operations center. "
            "Monitor traffic congestion and road conditions in the specified zone. "
            "Identify affected roads and estimate delays. "
            "Structure response with: congestion_level (low/medium/severe/critical), "
            "affected_roads (list of strings), estimated_delay_minutes (number), traffic_summary (string)."
        ),
        "output_schema": {
            "type": "object",
            "properties": {
                "congestion_level": {"type": "string"},
                "affected_roads": {"type": "array", "items": {"type": "string"}},
                "estimated_delay_minutes": {"type": "number"},
                "traffic_summary": {"type": "string"},
            },
            "required": ["congestion_level", "affected_roads", "traffic_summary"],
        },
        "authority_status": "authorized",
        "status": "active",
        "created_by": "system",
        "allowed_tools": ["traffic.read", "road.read"],
    },
    {
        "id": "infra-agent",
        "name": "Infrastructure Agent",
        "version": "1.0.0",
        "purpose": "Monitor drainage, pumping stations, and flood-prone infrastructure.",
        "capability_ids": ["infrastructure_monitoring"],
        "tools": ["drainage.read"],
        "system_prompt": (
            "You are the Infrastructure Agent for Chennai's city operations center. "
            "Assess drainage system capacity, identify overloaded zones, and flag infrastructure at risk. "
            "Structure response with: drainage_status (operational/strained/overloaded/failed), "
            "at_risk_zones (list), capacity_percentage (number 0-100), infra_summary (string)."
        ),
        "output_schema": {
            "type": "object",
            "properties": {
                "drainage_status": {"type": "string"},
                "at_risk_zones": {"type": "array", "items": {"type": "string"}},
                "capacity_percentage": {"type": "number"},
                "infra_summary": {"type": "string"},
            },
            "required": ["drainage_status", "at_risk_zones", "infra_summary"],
        },
        "authority_status": "authorized",
        "status": "active",
        "created_by": "system",
        "allowed_tools": ["drainage.read"],
    },
    {
        "id": "emergency-agent",
        "name": "Emergency Coordination Agent",
        "version": "1.0.0",
        "purpose": "Coordinate emergency response resources and recommend routing.",
        "capability_ids": ["emergency_coordination"],
        "tools": ["emergency.read"],
        "system_prompt": (
            "You are the Emergency Coordination Agent for Chennai's city operations center. "
            "Assess available emergency resources and recommend response priorities. "
            "Identify optimal routes for emergency vehicles. "
            "Structure response with: response_recommendation (string), priority_zones (list), "
            "recommended_route (string), estimated_eta_minutes (number), emergency_summary (string)."
        ),
        "output_schema": {
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
        "authority_status": "authorized",
        "status": "active",
        "created_by": "system",
        "allowed_tools": ["emergency.read"],
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# Authority records for system-created agents
# ─────────────────────────────────────────────────────────────────────────────
DENIED_TOOLS_ALL = ["citizen.read", "traffic.write", "road.write", "emergency.dispatch"]


def seed(db):
    print("[SEED] Starting database seed...")

    # Skip if already seeded
    existing = db.query(Agent).count()
    if existing >= 4:
        print(f"[SEED] Already seeded ({existing} agents). Skipping.")
        return

    # ── Capabilities ──────────────────────────────────────────────────────────
    for cap_data in SEED_CAPABILITIES:
        cap = Capability(**{k: v for k, v in cap_data.items()})
        db.merge(cap)
    db.commit()
    print(f"[SEED] Created {len(SEED_CAPABILITIES)} capabilities.")

    # ── Agents + Authority ────────────────────────────────────────────────────
    for agent_data in SEED_AGENTS:
        allowed_tools = agent_data.pop("allowed_tools")
        agent = Agent(**agent_data)
        db.merge(agent)

        # Grant allowed tools
        for tool in allowed_tools:
            auth = Authority(
                agent_id=agent_data["id"],
                tool_name=tool,
                decision="allow",
                reason="System agent — pre-authorized",
                granted_by="system-seed",
            )
            db.merge(auth)

        # Deny sensitive tools for all agents
        for tool in DENIED_TOOLS_ALL:
            auth = Authority(
                agent_id=agent_data["id"],
                tool_name=tool,
                decision="deny",
                reason="Sensitive tool — governance restricted",
                granted_by="system-seed",
            )
            db.merge(auth)

    db.commit()
    print(f"[SEED] Created {len(SEED_AGENTS)} agents with authority records.")

    # ── Initial workforce snapshot ─────────────────────────────────────────────
    snapshot = WorkforceSnapshot(
        agent_ids=[a["id"] for a in SEED_AGENTS],
        capability_ids=[c["id"] for c in SEED_CAPABILITIES],
        version=1,
        trigger="INITIAL_SEED",
    )
    db.add(snapshot)
    db.commit()
    print("[SEED] Created initial workforce snapshot (v1).")
    print("[SEED] Done. City workforce ready.")
    print("[SEED] NOTE: flood_passability NOT seeded — absent by design for Act II.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
