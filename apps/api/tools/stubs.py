"""
CIVIS — Deterministic Tool Stubs
Provides realistic, demo-safe sensor and telemetry data for Bengaluru East Corridor
(Bellandur / Silk Board corridor, Outer Ring Road, Koramangala - Varthur basin).
"""
from typing import Dict, Any, Optional
from tools.base import BaseTool


class WeatherReadTool(BaseTool):
    name = "weather.read"
    description = "Read current rainfall, flood risk levels, and atmospheric conditions for a city zone."
    risk_level = "low"
    parameters = {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "City or zone name"},
            "time_range": {"type": "string", "description": "Time window (e.g. '1h', '6h', '24h')"},
        },
        "required": ["location"],
    }

    def execute(self, location: str = "Bengaluru East Corridor", time_range: str = "1h", **kwargs) -> Dict[str, Any]:
        return {
            "location": location,
            "rainfall_mm": 142.5,
            "hourly_rate_mm": 38.0,
            "flood_risk_level": "critical",
            "wind_speed_kmh": 42.0,
            "pressure_hpa": 994.2,
            "precipitation_forecast_3h_mm": 85.0,
            "weather_summary": (
                "Severe monsoon cloudburst active over Bengaluru East Corridor. "
                "Total accumulated rainfall: 142.5mm with 38mm/hr intensity. "
                "Bellandur Lake spillway water levels rising rapidly."
            ),
        }


class TrafficReadTool(BaseTool):
    name = "traffic.read"
    description = "Read real-time traffic congestion, affected arterial corridors, and estimated transit delays."
    risk_level = "low"
    parameters = {
        "type": "object",
        "properties": {
            "zone": {"type": "string", "description": "City zone"},
            "time_range": {"type": "string", "description": "Time window"},
        },
        "required": ["zone"],
    }

    def execute(self, zone: str = "Bengaluru East Corridor", **kwargs) -> Dict[str, Any]:
        return {
            "zone": zone,
            "congestion_level": "critical",
            "average_speed_kmh": 6.5,
            "affected_roads": [
                "Outer Ring Road / ORR (Bellandur Spillway section)",
                "Marathahalli Main Road (near Junction flyover)",
                "Silk Board Interchange (HSR - Silk Board segment)",
                "HAL Airport Road Bypass",
            ],
            "estimated_delay_minutes": 55,
            "traffic_summary": (
                "Extreme congestion across Bengaluru East Corridor. Bellandur spillway bridge is impassable for standard vehicular flow. "
                "Traffic diverted toward HAL Airport Road. Outer Ring Road experiencing 3km vehicle queue."
            ),
        }


class RoadReadTool(BaseTool):
    name = "road.read"
    description = "Read road physical status, standing water depth, and vehicle category passability."
    risk_level = "low"
    parameters = {
        "type": "object",
        "properties": {
            "road_name": {"type": "string", "description": "Name of the road or corridor"},
            "zone": {"type": "string", "description": "City zone"},
        },
        "required": ["road_name"],
    }

    def execute(self, road_name: str = "Outer Ring Road (ORR)", zone: str = "Bengaluru East Corridor", **kwargs) -> Dict[str, Any]:
        return {
            "road_name": road_name,
            "zone": zone,
            "surface_status": "submerged_waterlogged",
            "water_depth_cm": 68.0,
            "passable_for_heavy_vehicles": True,
            "passable_for_light_vehicles": False,
            "passable_for_ambulances_4x4": True,
            "blockages": [
                "Bellandur Spillway Bridge approach water depth exceeds 65cm",
                "Submerged median divider near EcoSpace Tech Park",
            ],
            "road_summary": (
                f"{road_name} in {zone} is submerged under 68cm standing water. "
                "Light civilian vehicles prohibited. Heavy emergency 4x4 vehicles and high-clearance trucks can pass with caution."
            ),
        }


class DrainageReadTool(BaseTool):
    name = "drainage.read"
    description = "Read stormwater drainage capacity, pumping station status, and canal overflow metrics."
    risk_level = "low"
    parameters = {
        "type": "object",
        "properties": {
            "zone": {"type": "string", "description": "City zone"},
        },
        "required": ["zone"],
    }

    def execute(self, zone: str = "Bengaluru East Corridor", **kwargs) -> Dict[str, Any]:
        return {
            "zone": zone,
            "drainage_status": "overloaded",
            "capacity_percentage": 124.5,
            "at_risk_zones": [
                "Bengaluru East - Koramangala residential belt",
                "Bengaluru East - Varthur Lake outfall channel",
                "Bengaluru East - Bellandur Lake South Bank",
            ],
            "pumping_stations": {
                "Koramangala Pumping Station #1": "running_max_capacity_12000_lpm",
                "Bellandur Auxiliary Station #2": "generator_active_10000_lpm",
                "Varthur Canal Outfall": "overflow_risk_due_to_heavy_inflow",
            },
            "infra_summary": (
                "Stormwater system running at 124.5% capacity. Pumping stations operating at full throttle. "
                "Bellandur Lake spillway overflow creates backflow pressure at stormwater outfalls."
            ),
        }


class EmergencyReadTool(BaseTool):
    name = "emergency.read"
    description = "Read emergency response readiness, available ambulance/boat units, and designated staging zones."
    risk_level = "low"
    parameters = {
        "type": "object",
        "properties": {
            "zone": {"type": "string", "description": "City zone"},
            "incident_description": {"type": "string", "description": "Incident summary"},
        },
        "required": ["zone"],
    }

    def execute(self, zone: str = "Bengaluru East Corridor", incident_description: str = "", **kwargs) -> Dict[str, Any]:
        return {
            "zone": zone,
            "available_resources": {
                "advanced_life_support_ambulances": 4,
                "inflatable_rescue_boats": 3,
                "disaster_response_personnel": 28,
                "heavy_recovery_trucks": 2,
            },
            "priority_zones": [
                "Bellandur low-lying lakeside settlement (120 households)",
                "Koramangala 8th Block ground floor apartments",
            ],
            "recommended_staging_area": "Silk Board Junction Ground (Staging Hub A)",
            "recommended_primary_route": "HAL Airport Road -> Marathahalli ORR -> Bellandur West Approach",
            "estimated_eta_minutes": 14,
            "emergency_summary": (
                "4 ALS ambulances and 3 rescue boats deployed at Silk Board Staging Hub A. "
                "Disaster response team on 10-minute readiness for Bellandur lakeside evacuation."
            ),
        }


class ImageryReadTool(BaseTool):
    name = "imagery.read"
    description = "Read optical and SAR satellite/drone surface water imagery for flood boundary delineation."
    risk_level = "low"
    parameters = {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "Target coordinate or zone"},
            "sensor_type": {"type": "string", "description": "optical or sar"},
        },
        "required": ["location"],
    }

    def execute(self, location: str = "Bengaluru Bellandur", sensor_type: str = "optical", **kwargs) -> Dict[str, Any]:
        return {
            "location": location,
            "sensor_type": sensor_type,
            "timestamp": "2026-09-20T00:15:00Z",
            "water_reflectance_index": 0.86,
            "turbidity": "high",
            "surface_confidence": 0.94,
            "inundated_area_sq_km": 3.42,
            "flood_contour_vector": [
                {"lat": 12.9333, "lng": 77.6690},
                {"lat": 12.9385, "lng": 77.6740},
                {"lat": 12.9290, "lng": 77.6720},
            ],
            "imagery_summary": (
                "High-confidence standing water detected across 3.42 sq km along Bellandur - Outer Ring Road corridor. "
                "Turbid floodwater clearly identified along road boundaries."
            ),
        }

