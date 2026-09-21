<div align="center">

<img src="./apps/web/public/civis-logo.png" alt="CIVIS Logo" width="180" />

# CIVIS — Cities That Can Adapt.

**Autonomous Multi-Agent Crisis Response & Dynamic Capability Synthesis for Urban Resilience**

[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash%20%7C%20Pro-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Containers-Docker%20Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

<br />

<img src="./apps/web/public/civis-reimagined-city.jpg" alt="Bengaluru Corridor — CIVIS Autonomous Crisis Response" width="100%" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />

<p align="center">
  <em>Bellandur Lake & Outer Ring Road corridor — autonomous rescue drones, dynamic IoT stormwater gates, and a CIVIS Command Node governed by adaptive multi-agent AI.</em>
</p>

[**Live Demo**](http://localhost:3000) · [**API Docs**](http://localhost:8000/docs)

</div>

---

## The Problem

Every monsoon, Bengaluru — India's Silicon Valley — collapses under predictable yet unmanaged crises:

- **Bellandur Spillway** overflows, submerging the Outer Ring Road tech corridor under 68cm of water
- **Silk Board Junction** locks into multi-agency paralysis, freezing ambulances mid-response
- **Hebbal Expressway** suffers stormwater surges that cut off access to the international airport

Cities have sensors, cameras, and agencies — but each operates in an isolated silo. When a compound, unprecedented catastrophe strikes, static emergency playbooks fail.

---

## The CIVIS Approach

When the city's AI workforce encounters a crisis it has no tool to solve, CIVIS:

1. **Detects the capability gap** — queries the municipal registry and confirms `found: false`
2. **Synthesizes a specialist agent** — Gemini decomposes requirements and generates candidate code
3. **Runs adversarial evaluation** — 7-battery GovernOS test suite (`T01`–`T07`) catches policy violations
4. **Self-repairs failures** — the Forge streams corrected prompts until 100% pass rate
5. **Enforces human oversight** — Protocol Zero requires operator authorization before live deployment
6. **Permanently grows the city's intelligence** — capability is persisted with cryptographic provenance

The city no longer waits for bureaucratic meetings. Its intelligence adapts in real time.

---

## System Architecture

```mermaid
flowchart TD
    Browser["🖥️ Next.js 14 Command Center\nLeaflet GIS · React Flow · ICS PDF"]

    Browser -->|HTTP + SSE| FastAPI

    subgraph FastAPI["⚡ FastAPI Runtime"]
        EventBus["📡 EventBus\nPub/Sub + SSE Stream"]
        GovernOS["🛡️ GovernOS Authority\nTool Sandboxing"]
        Registry["📋 Capability Registry\nDynamic Schema Store"]
    end

    EventBus & GovernOS & Registry --> Mesh

    subgraph Mesh["🕸️ A2A Agent Workforce Mesh"]
        direction LR
        W[WeatherAgent]
        T[TrafficAgent]
        I[InfraAgent]
        E[EmergencyAgent]
        S(["+ SynthesizedAgent\non demand"])
    end

    Mesh -->|Capability Gap Detected| Forge

    subgraph Forge["🔧 Adaptation Engine"]
        F1["1. Decompose Capability Gap"]
        F2["2. Synthesize Specialist Code"]
        F3["3. GovernOS Evaluation T01–T07"]
        F4["4. Self-Repair Flawed Logic"]
        F5["5. Protocol Zero Auth Gate"]
        F6["6. Persist with SHA-256 Hash"]
        F1 --> F2 --> F3 --> F4 --> F5 --> F6
    end

    Forge --> Gemini
    Forge --> Postgres

    Gemini["🤖 Google Gemini 2.5\nFlash · Pro · Vision"]
    Postgres[("🗄️ PostgreSQL 15\nAgents · Capabilities\nProvenance Events")]

    style Browser fill:#0f172a,stroke:#38bdf8,color:#e2e8f0
    style FastAPI fill:#0f172a,stroke:#6366f1,color:#e2e8f0
    style Mesh fill:#0f172a,stroke:#22c55e,color:#e2e8f0
    style Forge fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style Gemini fill:#0f172a,stroke:#4285f4,color:#e2e8f0
    style Postgres fill:#0f172a,stroke:#336791,color:#e2e8f0
```

### Capability Adaptation Data Flow

```mermaid
flowchart LR
    A(["⚠️ Sensor Anomaly"]) --> B[EventBus]
    B --> C[Orchestrator]
    C --> D{{Capability\nRegistry Lookup}}

    D -->|Found ✓| E[Standard Dispatch]
    D -->|Not Found ✗| F[Forge Activation]

    E --> G(["✅ Incident Resolved"])

    F --> H[Gemini Synthesizes Agent]
    H --> I[GovernOS Evaluation T01–T07]
    I -->|Pass| J[Protocol Zero Auth]
    I -->|Fail| K[Self-Repair Loop]
    K --> I
    J --> L[Registry Updated]
    L --> E

    style A fill:#7f1d1d,stroke:#ef4444,color:#fecaca
    style G fill:#14532d,stroke:#22c55e,color:#bbf7d0
    style F fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style K fill:#1e1b4b,stroke:#8b5cf6,color:#ede9fe
    style J fill:#0c4a6e,stroke:#38bdf8,color:#e0f2fe
```

---

## Scenario Case Studies

### 1 · Bellandur Spillway Flood — `INC-2047`
**Zone**: East Bengaluru — Outer Ring Road / Mahadevapura  
**Trigger**: Sluice gate failure raises water depth to 68cm at Pier 4 Bridge  
**Gap**: No agent can compute flood-road passability for ALS 4x4 vehicles  
**Synthesis**: `PassageAssessmentAgent` with `flood_passability.calc`  
**Resolution**: Detour routed SLK → MRH → BLR-APP, corridor cleared in 14 minutes

### 2 · Silk Board Gridlock — `INC-2051`
**Zone**: South Bengaluru — Silk Board / BTM / Electronic City  
**Trigger**: Metro construction crane blocks the interchange; 380 vehicles deadlocked  
**Gap**: No agent has authority to coordinate signal override across 4 municipal zones  
**Synthesis**: `TrafficSwarmCoordinator` with `traffic_intercept.rebalance`  
**Resolution**: Coordinated signal cascade cleared junction in 6 minutes

### 3 · Hebbal Stormwater Surge — `INC-2059`
**Zone**: North Bengaluru — Hebbal Flyover / Airport Expressway  
**Trigger**: Stormwater surge overruns expressway drainage sumps; airport route cut off  
**Gap**: No agent can model drainage sump hydraulic capacity under surge conditions  
**Synthesis**: `DrainageHydroAgent` with `sump_hydraulics.predict`  
**Resolution**: 3 high-clearance units routed via NH-44 bypass to airport terminal

---

## Key Features

### Multimodal Computer Vision
Real-time simulated CCTV feeds processed by Gemini Vision across critical choke points with tri-spectral switching: **Optical RGB** · **Thermal FLIR** · **Gemini Semantic Segmentation** (neural polygon hazard masks classifying roadbed, water crest depth, and pedestrian risk zones).

### GovernOS Constitutional Safety
Every agent operates within a signed municipal charter defining its `allowed_tools`. Any attempt to access unassigned capabilities — traffic overrides, citizen registries — immediately halts execution and fires an `UNAUTHORIZED_TOOL_DENIED` audit event. No exceptions.

### Protocol Zero — Human-in-the-Loop
Before any synthesized agent joins the live workforce, a human operator receives a 30-second authorization countdown with full constitutional safety bounds displayed. The AI does not proceed without explicit human sign-off.

```mermaid
sequenceDiagram
    autonumber
    actor Op as 👤 Civic Operator
    participant PZ as Protocol Zero Gate
    participant Forge as Adaptation Forge
    participant Gov as GovernOS
    participant Mesh as A2A Workforce Mesh
    participant DB as PostgreSQL

    Forge->>Gov: Submit candidate agent for evaluation
    Gov->>Gov: Run T01–T07 battery
    alt Policy violation detected
        Gov-->>Forge: ❌ HALT — T03 FAIL (scope violation)
        Forge->>Forge: Diagnose & self-repair
        Forge->>Gov: Resubmit patched candidate
        Gov->>Gov: Re-run battery
    end
    Gov-->>PZ: ✅ All 7 batteries passed
    PZ->>Op: 🔔 Authorization required (30s countdown)
    Op-->>PZ: ✅ APPROVE — Scope Remediation Confirmed
    PZ->>Mesh: Authorize agent deployment
    Mesh->>DB: Persist capability + SHA-256 provenance hash
    DB-->>Mesh: Confirmed
    Mesh-->>Op: 🟢 Agent live — workforce expanded
```

### Cryptographic Provenance Ledger
Every adaptation cycle, evaluation run, repair event, and authorization decision is hashed with SHA-256 and chained into an immutable audit log. Municipal accountability is enforced by design.

### ICS Form 209 Incident Action Plan (PDF)
On-demand export of a 3-page A4 Situation Report conforming to the international Incident Command System standard — verbatim radio transcripts, multi-agency resource tables, and cryptographic verification hashes.

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | React 18 server components, streaming, SSR |
| **Mapping** | Leaflet + road-aligned route geometries | Real-time GIS with accurate road trajectories |
| **Agent Graph** | @xyflow/react (React Flow) | Interactive A2A workforce DAG visualization |
| **PDF Export** | jsPDF | ICS Form 209 compliant Situation Report |
| **Backend** | FastAPI + Python 3.11 | Async REST API + SSE gateway |
| **ORM** | SQLAlchemy 2.0 + Alembic | Relational persistence & schema migrations |
| **Database** | PostgreSQL 15 | Agents, capabilities, authority manifests, audit log |
| **AI** | Google Gemini 2.5 Flash & Pro | Vision, chain-of-thought, code synthesis, self-repair |
| **Styling** | Tailwind CSS + Radix UI | Tactical dark command center UI |
| **Infra** | Docker Compose | One-command full-stack orchestration |

---

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/Ritinpaul/Civis.git
cd Civis
cp .env.example .env
# Add your GEMINI_API_KEY to .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Tactical Command Center | http://localhost:3000 |
| FastAPI Swagger Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

### Manual Setup

**Backend**
```bash
cd apps/api
python -m venv venv && source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**
```bash
cd apps/web
npm install
npm run dev
```

---

## Project Structure

```
Civis/
├── apps/
│   ├── api/                        # FastAPI multi-agent backend
│   │   ├── core/                   # Config, database engine, settings
│   │   ├── intelligence/           # Gemini prompt templates & client
│   │   ├── models/                 # SQLAlchemy schemas
│   │   ├── orchestrators/          # Act I–IV lifecycle orchestrators
│   │   ├── routers/                # REST endpoints (incidents, workforce, forge)
│   │   ├── runtime/                # AgentRuntime & authority sandbox
│   │   ├── scripts/                # Database seed scripts
│   │   ├── services/               # EventBus, capability forge, GovernOS
│   │   ├── tests/                  # Pytest battery
│   │   └── tools/                  # Municipal tools (weather, road, drainage)
│   │
│   └── web/                        # Next.js 14 Tactical Command Center
│       ├── public/                 # Brand assets and visuals
│       └── src/
│           ├── app/                # App Router pages & API handlers
│           ├── components/
│           │   ├── command/        # TacticalMap, DiagnosticsDock, VisionModal
│           │   ├── growth/         # Capability directory & audit log
│           │   ├── shell/          # Sidebar, TopBar, AppShell
│           │   └── workforce/      # React Flow A2A mesh
│           ├── data/               # Road route geometries, transcripts
│           ├── lib/                # Store, SSE client, PDF engine
│           └── types/              # TypeScript interfaces
│
├── docker-compose.yml              # Multi-container orchestration
├── PRODUCT.md                      # Product scope & requirements
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values before running.

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | ✅ | — | Google Gemini API key — powers vision, synthesis, and chain-of-thought |
| `DATABASE_URL` | ✅ | `postgresql://civis:civis@localhost:5432/civis` | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | ⬜ | — | Optional OpenRouter key for model fallback routing |
| `ENVIRONMENT` | ⬜ | `development` | `development` or `production` |
| `DEMO_MODE` | ⬜ | `true` | Enables pre-seeded demo responses when Gemini is unavailable |
| `LOG_LEVEL` | ⬜ | `INFO` | Logging verbosity (`DEBUG` / `INFO` / `WARNING`) |
| `ALLOWED_ORIGINS` | ⬜ | `http://localhost:3000` | CORS whitelist (comma-separated URLs) |
| `NEXT_PUBLIC_API_URL` | ⬜ | `http://localhost:8000` | Backend URL used by the Next.js frontend |
| `DEMO_ACT1_DELAY` | ⬜ | `0.5` | Act I simulation delay (seconds) |
| `DEMO_ACT2_DELAY` | ⬜ | `0.5` | Act II simulation delay (seconds) |
| `DEMO_ACT3_DELAY` | ⬜ | `0.8` | Act III simulation delay (seconds) |
| `DEMO_ACT4_DELAY` | ⬜ | `0.5` | Act IV simulation delay (seconds) |

> **Note**: `DEMO_MODE=true` means the system falls back to hardcoded realistic responses if Gemini is unavailable — the full UI and narrative work without an API key in demo mode.

---

## API Reference

Interactive Swagger docs at `http://localhost:8000/docs` after startup.

### Core Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/v1/incidents` | List all incidents |
| `POST` | `/api/v1/incidents` | Create a new incident |
| `GET` | `/api/v1/incidents/{id}` | Get incident detail + timeline |
| `POST` | `/api/v1/incidents/act1` | Trigger Act I — baseline agent dispatch |
| `POST` | `/api/v1/incidents/act2` | Trigger Act II — capability gap detection |
| `GET` | `/api/v1/workforce/agents` | List all agents in the workforce mesh |
| `POST` | `/api/v1/workforce/agents/{id}/execute` | Execute a specific agent tool |
| `GET` | `/api/v1/capabilities` | List the municipal capability registry |
| `POST` | `/api/v1/capabilities/search` | Query registry for a capability by name |
| `POST` | `/api/v1/forge` | Synthesize a new specialist agent |
| `POST` | `/api/v1/evaluations/run` | Run the GovernOS T01–T07 evaluation battery |
| `POST` | `/api/v1/repair` | Trigger self-repair on a failed candidate |
| `GET` | `/api/v1/events/stream` | SSE stream of live incident events |
| `GET` | `/api/v1/provenance` | List cryptographic provenance audit log |
| `GET` | `/api/v1/provenance/timeline/{id}` | Full SHA-256 chain for an incident |
| `GET` | `/api/v1/authority/matrix` | View the full agent authority permission matrix |

---

## Known Limitations

Honest constraints of the current implementation:

| # | Limitation | Context |
| :-- | :--- | :--- |
| 1 | **CCTV feeds are simulated** | Tri-spectral camera views are generated from static images + CSS overlays, not live video streams. A real deployment would connect to actual CCTV RTSP feeds. |
| 2 | **IoT sensor data is seeded** | Flood depth, temperature, and flow rate readings are pre-seeded into PostgreSQL. Production would wire to live sensor APIs (BBMP SCADA / IMD feeds). |
| 3 | **Agent synthesis is prompt-based** | The Forge generates Python-like pseudocode, not fully executable agent binaries. A production system would sandbox and run the synthesized code in an isolated container. |
| 4 | **Protocol Zero is a 30s timer** | Human authorization is simulated via a countdown. A real deployment would integrate with operator authentication (MFA, on-call pager systems). |
| 5 | **Map routing uses pre-computed geometries** | Road-aligned detour paths are pre-computed OSRM routes, not live routing API calls. Real-time routing would require an OSRM or Valhalla server. |

---

## Roadmap

Capabilities planned for future iterations:

- [ ] **Live IoT Sensor Ingestion** — Wire BBMP stormwater SCADA and IMD weather feeds directly into the EventBus
- [ ] **Real CCTV Integration** — Replace simulated feeds with RTSP stream processing via Gemini Video API
- [ ] **Mobile Command App** — React Native companion app for field operators to approve Protocol Zero on-the-go
- [ ] **Multi-City Support** — Extend scenario presets beyond Bengaluru (Chennai, Mumbai, Hyderabad flood corridors)
- [ ] **Executable Agent Sandbox** — Run Forge-synthesized agent code in a gVisor-isolated container runtime
- [ ] **Federated GovernOS** — Cross-agency authority mesh with distributed consensus for multi-city emergency coordination

---

<div align="center">
  <sub>Built for resilient, adaptive cities of tomorrow.</sub>
</div>
