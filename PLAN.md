# CIVIS — Complete Phase-by-Phase Implementation Plan
### *Cities that can adapt.*

> **Definition of Done**: Encounter unknown problem → identify gap → forge specialist → test → fail → repair → govern → swarm → resolve → persist.

---

## Confirmed Decisions

| Decision | Choice |
|----------|--------|
| **AgentVerse** | Read-only reference in `references/agentverse/` |
| **AI for coding** | Gemini 2.5 Flash (Antigravity IDE) |
| **App AI — fast jobs** | `gemini-2.5-flash` (understand, decompose, eval, swarm) |
| **App AI — forge/repair** | `gemini-2.5-pro` or `gemini-3.0` (specify_specialist, analyze_failure, plan_repair) |
| **Frontend hosting** | Vercel (Next.js native) |
| **Backend hosting** | Railway (FastAPI + PostgreSQL) |
| **Deployment** | Cloud-hosted, judge-accessible URL |

---

## Deployment Architecture

```
GitHub repo (main branch)
   ├── Vercel  → civis.vercel.app  (Next.js 14)
   └── Railway → civis-api.railway.app (FastAPI + PostgreSQL 15)

NEXT_PUBLIC_API_URL = https://civis-api.railway.app
Judges get one URL: https://civis.vercel.app
```

Core Loop: Understand → Discover → Adapt → Prove → Authorize → Coordinate → Resolve → Learn

---

## Phase 0 — Bootstrap & AgentVerse Reference
**Time: 1-2 hours**
- Clone AgentVerse read-only: `references/agentverse/`
- Create monorepo: `apps/web` (Next.js), `apps/api` (FastAPI), `packages/schemas`, `packages/demo`
- Create `PRODUCT.md`, `.env.example`, `docker-compose.yml` (local dev), `railway.toml` (prod)
- Init git, push to GitHub (needed for Vercel + Railway auto-deploy)

## Phase 1 — Data Models (7 models)
**Time: 3-4 hours**
- `Incident`, `Capability`, `Agent`, `Evaluation`, `Authority`, `WorkforceSnapshot`, `ProvenanceEvent`
- SQLAlchemy 2.0 + Alembic migrations
- Seed script: 4 base agents, 4 capabilities, `flood_passability` deliberately absent

## Phase 2 — FastAPI + SSE
**Time: 2-3 hours**
- `GET /health`, `/workforce/current`, `/incidents`, `/capabilities`
- `GET /events/stream` (SSE per incident_id)
- `EventBus` in-memory service
- CORS configured for Vercel domain

## Phase 3 — 4 Base Agents
**Time: 4-5 hours**
- `WeatherAgent`, `TrafficAgent`, `InfrastructureAgent`, `EmergencyAgent`
- `AgentRuntime` derived from AgentVerse message-passing pattern
- `ToolRegistry` with deterministic stubs (demo-safe)
- All use `gemini-2.5-flash`

## Phase 4 — Gemini Intelligence Layer (7 jobs)
**Time: 4-6 hours**
```
gemini-2.5-flash (fast, cost-efficient):
  1. understand_incident
  2. decompose_capabilities
  4. generate_evaluation_cases
  7. coordinate_swarm

gemini-2.5-pro (complex reasoning):
  3. specify_specialist   (design Passage Agent manifest)
  5. analyze_failure      (diagnose T03)
  6. plan_repair          (improve manifest)
```
- All: JSON mode + Pydantic validation
- `DEMO_RESPONSES` fallback dict for reliability

## Phase 5 — Capability Registry
**Time: 3-4 hours**
- `POST /capabilities/search` → FOUND or NOT FOUND (triggers forge)
- Pre-seeded: 4 caps exist, `flood_passability` NOT FOUND
- Fuzzy match + exact ID match

## Phase 6 — Act I (Known Problem)
**Time: 2-3 hours**
- `INC-001`: Monsoon Waterlogging, Chennai Zone 4
- 4 agents respond, 11 SSE events, `INCIDENT_RESOLVED`

## Phase 7 — Act II (Unknown Problem)
**Time: 2-3 hours**
- `INC-002`: Unknown Road Accessibility Anomaly
- All 4 agents: `INSUFFICIENT`
- `CAPABILITY_GAP` emitted — hero moment

## Phase 8 — Adaptation Engine (Forge)
**Time: 6-8 hours**
- `gemini-2.5-pro` → designs `AgentManifest` JSON
- Passage Agent created, `status=untrusted`
- RULE: `Gemini → JSON Manifest → Runtime` (NO code generation)

## Phase 9 — Generic Agent Runtime
**Time: 3-4 hours**
- Reads any manifest, executes via `gemini-2.5-flash`
- Hard authority check before EVERY tool call
- Derived from AgentVerse runtime patterns

## Phase 10 — Evaluation Engine
**Time: 5-7 hours**
- 7 test cases (T01–T07)
- T03 MUST genuinely fail first run (PASSABLE returned, UNKNOWN expected)
- State machine: `UNTRUSTED → EVALUATING → FAILED → REPAIRING → PASSED`

## Phase 11 — Repair Engine
**Time: 3-4 hours**
- `gemini-2.5-pro` diagnoses T03, updates `system_prompt` in manifest
- Re-evaluation: T03 passes

## Phase 12 — Governance & Authority
**Time: 4-5 hours**
- ALLOWED: `road.read`, `weather.read`, `imagery.read`
- DENIED: `citizen.read`, `traffic.write`, `emergency.dispatch`
- Hard enforcement in `GenericAgentRuntime`

## Phase 13 — Multi-Agent Swarm
**Time: 4-6 hours**
- 5-agent swarm via `gemini-2.5-flash` coordination
- Order: Weather → Infra → Passage → Traffic → Emergency
- React Flow graph animated in frontend

## Phase 14 — Capability Persistence (Act IV)
**Time: 2-3 hours**
- `flood_passability v1.0.0` registered as `verified`
- Workforce: 4 → 5 capabilities

## Phase 15 — Provenance Engine
**Time: 2-3 hours**
- 20-event immutable timeline for INC-002
- `GET /provenance?incident_id=INC-002`

## Phase 16 — One-Click Demo Mode
**Time: 3-4 hours**
- `POST /demo/reset`, `/demo/run`, `/demo/act1-4`
- T03 scripted to fail first, pass after repair (deterministic)
- Gemini timeouts → `DEMO_RESPONSES` fallback

## Phase 17 — Next.js Frontend (7 screens)
**Time: 10-14 hours**
- Screen 1: Command Center (workforce + incidents)
- Screen 2: Live Incident Timeline (SSE-driven)
- Screen 3: Capability Gap Modal (full-screen pulsing)
- Screen 4: Evaluation Panel (T03 fail → repair → pass)
- Screen 5: Authority Panel (allow/deny matrix)
- Screen 6: React Flow Workforce Graph (Passage Agent joins)
- Screen 7: Workforce Growth (4→5 capabilities)
- Design: `#0a0d12` bg, `#00d4ff` cyan, `JetBrains Mono` + `Inter`

## Phase 18 — Integration Tests
**Time: 4-6 hours**
- `test_unknown_problem_adaptation`: 11 pipeline assertions

## Phase 19 — Demo Hardening
**Time: 4-5 hours**
- Gemini timeout → fallback, ghost data, SSE reconnect
- Final 8-item checklist

## Phase 20 — Docs + Submission
**Time: 3-5 hours**
- README (14 sections), `evidence/` package, limitations section

## Phase 21 — Cloud Deployment
**Time: 2-3 hours**
- **Railway**: FastAPI + PostgreSQL
  - `railway.toml`, env vars: `GEMINI_API_KEY`, `DATABASE_URL`
  - `alembic upgrade head` on deploy, seed script runs
  - Auto-deploy from GitHub main
- **Vercel**: Next.js
  - Connect GitHub repo, set `NEXT_PUBLIC_API_URL=https://<railway-domain>`
  - Auto-deploy on push
- **Smoke test**: `POST /demo/reset && POST /demo/run` on production URL
- Judges get: `https://civis.vercel.app`

---

## Build Blocks

| Block | Phases | Milestone |
|-------|--------|-----------|
| BLOCK 1 | 0 → 3 | Repo + DB + 4 Agents running |
| BLOCK 2 | 4 → 6 | Gemini integrated + Act I |
| BLOCK 3 | 5 → 7 | Capability Registry + Act II |
| BLOCK 4 | 8 → 11 | Forge + Eval + T03 Fail + Repair |
| BLOCK 5 | 12 → 14 | Governance + Swarm + Persist |
| BLOCK 6 | 15 → 16 | Provenance + Demo Mode |
| BLOCK 7 | 17 | Frontend (7 screens) |
| BLOCK 8 | 18 → 21 | Tests + Hardening + Docs + Deploy |

**Total: ~80–115 hours**

---

## NOT Building
- Agent marketplace, blockchain, mobile app
- 30+ agents (5 is the story)
- Real emergency dispatch or traffic control
- Arbitrary code generation/execution
- Custom WebSocket (SSE is sufficient)

