# CIVIS — Product Freeze Document

**Name**: CIVIS  
**Tagline**: Cities that can adapt.  
**Status**: LOCKED — No scope changes during implementation.

---

## The Core Idea

Cities deploy AI workforces. When they encounter problems their agents can't solve, CIVIS identifies the missing capability, creates a new specialist agent, tests it rigorously (including catching its own failures), grants it bounded authority, deploys it into the workforce, and permanently grows the city's intelligence.

---

## Demo Environment

- **City**: Chennai, India (monsoon-season flooding)
- **Zone**: Zone 4 (Saidapet / Velachery corridor)

---

## The Four-Act Story

| Act | Incident | What Happens |
|-----|----------|--------------|
| **I — The city knows** | INC-001: Monsoon Waterlogging | Existing 4-agent workforce resolves it. System works. |
| **II — The city doesn't know** | INC-002: Unknown Road Anomaly | Workforce attempts but cannot resolve. Capability gap identified. |
| **III — The city adapts** | INC-002 continued | CIVIS forges Passage Agent, evaluates it, catches T03 failure, repairs it, governs its authority, deploys it. |
| **IV — The city has grown** | INC-002 resolved | 5-agent swarm resolves the incident. `flood_passability` permanently added to registry. |

---

## Agents (5 total — not 30)

| Agent | Status | Capability |
|-------|--------|-----------|
| WeatherAgent | Pre-existing | `weather_assessment` |
| TrafficAgent | Pre-existing | `traffic_monitoring` |
| InfrastructureAgent | Pre-existing | `infrastructure_monitoring` |
| EmergencyAgent | Pre-existing | `emergency_coordination` |
| **PassageAgent** | **CIVIS-forged** | **`flood_passability`** |

---

## What CIVIS Does NOT Do

- Generate executable code
- Deploy real emergency vehicles or control traffic signals
- Support multiple cities
- Have a token economy, marketplace, or blockchain
- Build a 3D digital twin
- Run a mobile app
