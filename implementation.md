# CIVIS

### **Cities that can adapt.**

The product is no longer positioned as an “agent framework” or “agent foundry.” It is an **adaptive civic intelligence system**: a city AI workforce that can identify missing capabilities, safely create and prove them, authorize them within strict boundaries, and add them to the workforce when an unfamiliar real-world problem appears.

Now we should build it in a strict order. **No more ideation while building.**

---

# 1. The Final CIVIS Product

The complete experience is:

```text
                    CIVIS
             Cities that can adapt.
                       │
                       ▼
              REAL-WORLD INCIDENT
                       │
                       ▼
              GEMINI UNDERSTANDS
                       │
                       ▼
             CAPABILITY DECOMPOSITION
                       │
              ┌────────┴────────┐
              │                 │
        CAPABILITY EXISTS   CAPABILITY MISSING
              │                 │
              ▼                 ▼
          DISCOVER             CIVIS
                                │
                                ▼
                              FORGE
                                │
                                ▼
                         NEW SPECIALIST
                                │
                                ▼
                           EVALUATE
                                │
                       ┌────────┴────────┐
                       │                 │
                     FAIL              PASS
                       │                 │
                    REPAIR               │
                       │                 │
                       └───────►─────────┘
                                │
                                ▼
                         GOVERNANCE
                                │
                                ▼
                       LIMITED AUTHORITY
                                │
                                ▼
                         CITY WORKFORCE
                                │
                                ▼
                          SWARM RESPONSE
                                │
                                ▼
                          PROBLEM SOLVED
                                │
                                ▼
                       CAPABILITY PERSISTED
```

The core conceptual loop is:

> **Understand → Discover → Adapt → Prove → Authorize → Coordinate → Resolve → Learn**

---

# 2. The Golden Rule Before You Start

Build **the backend story before the beautiful frontend**.

Your first goal is not:

> "I need a beautiful hackathon UI."

Your first goal is:

> **I need one command that proves CIVIS can encounter an unknown problem and become capable of solving it.**

Once that works, the UI becomes a visualization of a working system.

---

# PHASE 0 — Product Freeze

### Time: 30–60 minutes

Create a `PRODUCT.md`.

Lock:

### Name

**CIVIS**

### Tagline

**Cities that can adapt.**

### One-line description

> CIVIS is an adaptive AI workforce for cities that can identify missing capabilities, safely develop and prove them, and deploy them when unfamiliar real-world problems emerge.

### Core scenario

Use a Chennai-style urban flooding environment for the demo.

But remember:

> **Flooding is the demonstration environment, not the product.**

CIVIS should eventually work across:

* flooding
* traffic disruptions
* infrastructure failures
* public-space incidents
* transit disruptions
* environmental anomalies
* utility problems
* emergency coordination

Don't build those now.

---

# PHASE 1 — Repository & Development Environment

### Time: 2–3 hours

Create:

```text
civis/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── schemas/
│   └── demo/
│
├── docs/
│
├── tests/
│
├── scripts/
│
├── docker-compose.yml
├── .env.example
├── README.md
└── PRODUCT.md
```

---

## Backend

Use:

```text
Python
FastAPI
Pydantic
SQLAlchemy
PostgreSQL
```

---

## Frontend

Use:

```text
Next.js
TypeScript
Tailwind
shadcn/ui
React Flow
Framer Motion
```

Keep animations restrained.

CIVIS should look like **civic infrastructure**, not an AI toy.

---

## Development services

Initially:

```text
Frontend
   ↓
FastAPI
   ↓
PostgreSQL
```

Realtime:

```text
FastAPI
   ↓
SSE
   ↓
Next.js
```

Don't build custom WebSocket infrastructure unless SSE genuinely becomes insufficient.

---

# PHASE 2 — Core Data Architecture

### Time: 3–4 hours

Create the database models.

You need **seven primary concepts**.

---

## 2.1 Incident

```python
class Incident:
    id
    title
    description
    location
    severity
    status
    evidence
    created_at
    resolved_at
```

Example:

```json
{
  "id": "INC-002",
  "title": "Unknown road accessibility anomaly",
  "location": "Chennai",
  "severity": "high",
  "status": "investigating"
}
```

---

# 2.2 Capability

This is central to CIVIS.

```text
Capability
├── id
├── name
├── purpose
├── inputs
├── outputs
├── required_tools
├── version
└── status
```

Example:

```json
{
  "id": "flood_passability",
  "name": "Dynamic Flood-Road Passability",
  "purpose": "Determine whether a flooded road is safely passable",
  "inputs": [
    "street_image",
    "weather",
    "road_geometry"
  ],
  "outputs": [
    "passability_result"
  ],
  "required_tools": [
    "road.read",
    "weather.read",
    "imagery.read"
  ],
  "status": "verified"
}
```

---

# 2.3 Agent

```text
Agent
├── id
├── name
├── version
├── purpose
├── capabilities
├── tools
├── authority
└── status
```

Initial workforce:

```text
weather-agent
traffic-agent
infrastructure-agent
emergency-agent
```

New specialist:

```text
passage-agent
```

---

# 2.4 Evaluation

```text
Evaluation
├── id
├── agent_id
├── capability_id
├── test_case
├── expected_output
├── actual_output
├── status
└── reason
```

---

# 2.5 Authority

```text
Authority
├── agent_id
├── allowed_tools
├── denied_tools
├── status
└── granted_at
```

---

# 2.6 Workforce

Represent the current city capability state:

```text
Workforce
├── agents
├── capabilities
└── version
```

This becomes important at the end when you show:

```text
BEFORE
4 agents / 4 core capabilities

AFTER
5 agents / 5 capabilities
```

---

# 2.7 Provenance Event

Every important event gets logged.

```text
ProvenanceEvent
├── incident_id
├── event_type
├── actor
├── payload
└── timestamp
```

---

# PHASE 3 — Build the Existing City Workforce

### Time: 4–6 hours

**Do this before Forge/Adaptation.**

We need to prove that CIVIS already has a functioning workforce.

---

## Weather Agent

Input:

```text
rainfall
forecast
weather conditions
```

Output:

```json
{
  "rainfall": "heavy",
  "flood_risk": "high"
}
```

---

## Traffic Agent

Output:

```json
{
  "congestion": "severe",
  "affected_roads": []
}
```

---

## Infrastructure Agent

Output:

```json
{
  "drainage_status": "overloaded",
  "affected_zones": []
}
```

---

## Emergency Agent

Responsible for:

```text
response prioritization
coordination
escalation
```

---

# PHASE 4 — Known Problem Scenario

### Time: 2–3 hours

Create the first act.

The problem:

> **Persistent monsoon waterlogging affecting known roads.**

CIVIS receives the incident.

Existing workforce handles it:

```text
WEATHER
   ↓
INFRASTRUCTURE
   ↓
TRAFFIC
   ↓
EMERGENCY
```

Result:

```text
affected roads identified
traffic recommendation generated
high-risk area identified
response recommendation produced
```

The important thing:

### Don't show Forge yet.

We want the judge to think:

> "Okay, this city workforce actually works."

---

# PHASE 5 — Gemini Intelligence Layer

### Time: 4–6 hours

Now integrate Gemini deeply.

Gemini should not just generate the final answer.

It should perform multiple reasoning jobs.

---

## Capability 1 — Multimodal understanding

Input:

```text
incident
+
images
+
weather
+
location
```

Gemini outputs structured understanding:

```json
{
  "incident_type": "urban_flooding",
  "known_factors": [],
  "unknown_factors": [],
  "required_capabilities": []
}
```

---

# Capability 2 — Capability decomposition

Example:

```text
Question:

Can an emergency vehicle safely use Road X?
```

Gemini reasons:

```text
Need:
- current road state
- flood level
- road geometry
- visibility
- weather

Potential capability:
Dynamic Flood-Road Passability
```

---

# Capability 3 — Capability discovery

Gemini proposes the requirement.

Your registry determines whether it exists.

This distinction matters:

```text
Gemini:
"What capability do we need?"

Registry:
"Does that capability exist?"
```

---

# Capability 4 — Specialist specification

Gemini creates:

```json
{
  "name": "Passage Agent",
  "purpose": "Assess road passability",
  "inputs": [],
  "outputs": [],
  "tools": []
}
```

---

# Capability 5 — Evaluation generation

Gemini proposes adversarial test cases.

Your deterministic test engine evaluates the results.

---

# Capability 6 — Repair reasoning

Gemini analyzes failed tests and proposes a repair.

---

# Capability 7 — Coordination

Gemini can help determine:

```text
Which agent should handle which subproblem?
```

---

# PHASE 6 — Capability Registry

### Time: 3–4 hours

Create:

```http
GET /capabilities
GET /capabilities/{id}
POST /capabilities
POST /capabilities/search
```

---

## The critical operation

```python
find_capability("flood_passability")
```

Two outcomes.

### Existing

```text
CAPABILITY FOUND
→ discover existing specialist
```

### Missing

```text
CAPABILITY NOT FOUND
→ CAPABILITY GAP
→ initiate adaptation
```

This becomes the central branching point of CIVIS.

---

# PHASE 7 — The Unknown Problem

### Time: 2–3 hours

Now create Act II.

Introduce something the existing workforce doesn't know how to answer.

For example:

> A newly observed road condition makes ordinary flood/traffic information insufficient to determine whether emergency vehicles can safely traverse the road.

Existing agents attempt:

```text
Weather          → insufficient
Traffic          → insufficient
Infrastructure   → insufficient
Emergency        → insufficient
```

CIVIS concludes:

```text
CAPABILITY GAP

Required:
Dynamic Flood-Road Passability

Registry:
NOT FOUND
```

This is the **hero moment**.

Put this prominently in the UI.

---

# PHASE 8 — CIVIS ADAPTATION ENGINE

### Time: 6–8 hours

This is where the old "Forge" concept becomes an internal implementation mechanism, **not the product identity**.

The user sees:

> **CIVIS IS ADAPTING**

not:

> FORGE ENGINE

---

## Adaptation pipeline

```text
CAPABILITY GAP
      ↓
SPECIFICATION
      ↓
SPECIALIST CREATED
      ↓
EVALUATION
```

---

## Specialist manifest

```json
{
  "id": "passage-agent",
  "version": "0.1.0",
  "purpose": "Assess road passability during flooding",
  "capabilities": [
    "flood_assessment"
  ],
  "inputs": [
    "street_image",
    "weather",
    "road_geometry"
  ],
  "outputs": [
    "passability_result"
  ],
  "tools": [
    "road.read",
    "weather.read",
    "imagery.read"
  ],
  "authority": "none",
  "status": "untrusted"
}
```

---

# VERY IMPORTANT

Do **not** have Gemini generate arbitrary executable code.

Don't do:

```text
Gemini
 ↓
Python code
 ↓
execute
```

Instead:

```text
Gemini
 ↓
Agent Manifest
 ↓
Generic Agent Runtime
 ↓
Approved Tools
```

This makes the architecture much safer and easier to demonstrate.

---

# PHASE 9 — Generic Agent Runtime

### Time: 3–4 hours

Build:

```python
AgentRuntime.execute(
    agent,
    task
)
```

The runtime reads the manifest.

It determines:

```text
What inputs?
What tools?
What outputs?
What permissions?
```

This means CIVIS can create a new specialist **without creating a new codebase for every agent.**

That is an important technical property.

---

# PHASE 10 — Evaluation Engine

### Time: 5–7 hours

Now prove that the new specialist deserves to participate.

Evaluation states:

```text
UNTRUSTED
    ↓
EVALUATING
    ↓
FAILED
    ↓
REPAIRING
    ↓
EVALUATING
    ↓
PASSED
```

---

## Evaluation suite

### Test 1

Clear road:

```text
PASSABLE
```

### Test 2

Deep flooding:

```text
BLOCKED
```

### Test 3

Poor visibility:

```text
UNKNOWN
```

### Test 4

Missing evidence:

```text
UNKNOWN
```

### Test 5

Contradictory evidence:

```text
ESCALATE
```

### Test 6

Malformed tool output:

```text
SAFE FAILURE
```

### Test 7

Unauthorized operation:

```text
DENY
```

---

# PHASE 11 — Deliberate Failure + Repair

### Time: 3–4 hours

This should be **one of the strongest moments in the demo.**

Initial specialist makes an incorrect decision:

```text
TEST 03

Input:
Incomplete visual evidence

Agent:
PASSABLE

Expected:
UNKNOWN

✕ FAILED
```

CIVIS:

> **Capability failed evaluation.**

Then:

```text
REPAIR INITIATED
```

Gemini analyzes:

```text
Failure:
Insufficient evidence was interpreted as passable.

Repair:
Require sufficient evidence before returning PASSABLE/BLOCKED.
Otherwise return UNKNOWN.
```

Re-test:

```text
TEST 03

Result:
UNKNOWN

✓ PASSED
```

Now the audience sees:

> CIVIS didn't blindly trust the agent it created.

That's much stronger than simply showing "Agent created."

---

# PHASE 12 — Governance & Authority

### Time: 4–5 hours

Now the agent is verified.

But:

> **Verified does not mean unrestricted.**

Use:

```text
UNTRUSTED
↓
EVALUATING
↓
VERIFIED
↓
LIMITED AUTHORITY
↓
EXPANDED AUTHORITY
```

For the demo, grant:

### Allowed

```yaml
road.read
weather.read
imagery.read
```

### Denied

```yaml
citizen.read
emergency.dispatch
traffic.write
```

---

# PHASE 13 — Make Governance Actually Enforceable

### Time: 2–3 hours

This cannot be a UI-only feature.

Implement:

```python
authorize(agent_id, tool)
```

Example:

```text
Passage Agent
    ↓
road.read
    ↓
ALLOW
```

Then:

```text
Passage Agent
    ↓
citizen.read
    ↓
DENY
```

UI:

```text
AUTHORIZATION

road.read          ✓ ALLOW
weather.read       ✓ ALLOW
imagery.read       ✓ ALLOW

citizen.read       ✕ DENY
traffic.write      ✕ DENY
```

The backend must produce the same decision.

---

# PHASE 14 — Multi-Agent Swarm

### Time: 4–6 hours

Now bring the new specialist into the workforce.

Before:

```text
Weather
Traffic
Infrastructure
Emergency
```

After:

```text
Weather
Traffic
Infrastructure
Emergency
Passage
```

---

## Coordination

Example:

```text
Emergency Agent
        ↓
"What roads can emergency vehicles use?"
        ↓
Passage Agent
        ↓
road.read
weather.read
imagery.read
        ↓
BLOCKED
        ↓
Traffic Agent
        ↓
Route recalculation
        ↓
Emergency Agent
        ↓
Response recommendation
```

Now it feels like a workforce rather than five disconnected chatbots.

---

# PHASE 15 — Resolve the Unknown Problem

### Time: 2–3 hours

Final sequence:

```text
UNKNOWN PROBLEM
       ↓
Existing workforce insufficient
       ↓
Capability gap
       ↓
New specialist
       ↓
Evaluation
       ↓
Failure
       ↓
Repair
       ↓
Pass
       ↓
Authority
       ↓
Swarm
       ↓
Resolution
```

Then persist:

```text
flood_passability v1
```

in the capability registry.

---

# PHASE 16 — Provenance Engine

### Time: 2–3 hours

Everything needs an audit trail.

Example:

```text
14:02:11 INCIDENT_RECEIVED
14:02:12 GEMINI_UNDERSTOOD
14:02:13 CAPABILITIES_DECOMPOSED
14:02:14 CAPABILITY_SEARCH
14:02:14 CAPABILITY_NOT_FOUND
14:02:15 ADAPTATION_STARTED
14:02:17 SPECIALIST_CREATED
14:02:18 EVALUATION_STARTED
14:02:19 EVALUATION_FAILED
14:02:20 REPAIR_STARTED
14:02:22 EVALUATION_PASSED
14:02:23 AUTHORITY_REQUESTED
14:02:24 AUTHORITY_GRANTED
14:02:25 SWARM_DISPATCHED
14:02:29 INCIDENT_RESOLVED
```

This gives you a credible answer to:

> "How do you know what happened?"

---

# PHASE 17 — The CIVIS UI

### Time: 8–12 hours

Only now build the polished interface.

The UI should feel like:

**city operations center + adaptive intelligence**

Not:

**generic AI dashboard.**

---

# Screen 1 — CIVIS Command

```text
CIVIS
Cities that can adapt.

CHENNAI
CITY OPERATIONS
```

Show current workforce:

```text
● Weather
● Traffic
● Infrastructure
● Emergency
```

---

# Screen 2 — Known Problem

```text
ACTIVE INCIDENT

MONSOON WATERLOGGING

Chennai
High severity
```

Show agents communicating.

Then:

```text
INCIDENT RESOLVED
```

This establishes the baseline.

---

# Screen 3 — Unknown Problem

Suddenly:

```text
NEW INCIDENT
```

Existing workforce:

```text
Weather          insufficient
Traffic          insufficient
Infrastructure   insufficient
Emergency        insufficient
```

Then:

# CAPABILITY GAP

```text
Required:
Dynamic Flood-Road Passability
```

---

# Screen 4 — Adaptation

Instead of "Forge":

# CIVIS IS ADAPTING

```text
NEW SPECIALIST

PASSAGE AGENT

Purpose:
Assess road passability during flooding
```

---

# Screen 5 — Prove

```text
CAPABILITY EVALUATION

✓ Clear road
✓ Deep flooding
✕ Ambiguous evidence
```

Then:

```text
REPAIRING...
```

Then:

```text
✓ Ambiguous evidence
```

---

# Screen 6 — Authority

```text
PASSAGE AGENT

VERIFIED

AUTHORITY

✓ road.read
✓ weather.read
✓ imagery.read

✕ citizen.read
✕ traffic.write
✕ emergency.dispatch
```

---

# Screen 7 — Workforce

React Flow visualization:

```text
                WEATHER
                   │
                   ▼
INFRASTRUCTURE → PASSAGE
                   │
                   ▼
                TRAFFIC
                   │
                   ▼
               EMERGENCY
```

---

# Screen 8 — Outcome

```text
INCIDENT RESOLVED

Safe route identified
Blocked road avoided
Emergency response rerouted
```

---

# Screen 9 — Adaptation Result

This is your conceptual payoff.

```text
CITY CAPABILITY

BEFORE
────────────────
4 capabilities

AFTER
────────────────
5 capabilities

+ Dynamic Flood-Road Passability
```

Then:

> **The city didn't know what capability it would need next.**

> **CIVIS built it when the problem arrived.**

---

# PHASE 18 — One-Click Demo Mode

### Time: 3–4 hours

Create:

```http
POST /demo/reset
POST /demo/run
```

One button:

# RUN CITY ADAPTATION

It should run the complete story deterministically.

Do not depend on random Gemini outputs during judging.

Gemini should genuinely participate, but your critical demo path should have deterministic safeguards/fallbacks.

---

# PHASE 19 — Testing

### Time: 4–6 hours

Write tests for:

```text
capability lookup
capability creation
agent creation
evaluation
repair
authorization
denial
delegation
provenance
```

---

## Critical integration test

Create:

```python
test_unknown_problem_adaptation()
```

It should verify:

```text
✓ incident detected
✓ capability gap detected
✓ specialist created
✓ evaluation failed
✓ repair initiated
✓ evaluation passed
✓ authority granted
✓ unauthorized tool denied
✓ swarm executed
✓ incident resolved
✓ capability persisted
```

If this test passes, your core product works.

---

# PHASE 20 — Demo Hardening

### Time: 4–5 hours

Now eliminate anything that can break the presentation.

Test:

* API failure
* Gemini timeout
* malformed Gemini response
* missing evidence
* invalid agent output
* unauthorized tool request
* database restart
* repeated demo runs

The demo should have:

```text
RESET
 ↓
RUN
 ↓
COMPLETE
```

every time.

---

# PHASE 21 — Final Demo

Your final demo should be **90–120 seconds**.

## 0–10 sec

> **“Every city has problems it knows how to solve. But what happens when tomorrow brings a problem the city has never seen before?”**

---

## 10–30 sec

Known flooding problem.

Existing workforce solves it.

---

## 30–45 sec

Unknown anomaly.

Existing workforce fails.

```text
CAPABILITY GAP
```

---

## 45–55 sec

> **“CIVIS doesn't guess. It identifies what it's missing.”**

---

## 55–70 sec

New specialist created.

```text
PASSAGE AGENT
```

---

## 70–80 sec

Evaluation:

```text
✕ FAIL
```

Repair:

```text
✓ PASS
```

---

## 80–90 sec

Governance:

```text
road.read        ALLOW
weather.read     ALLOW
imagery.read     ALLOW

citizen.read     DENY
traffic.write    DENY
```

---

## 90–110 sec

Swarm:

```text
Weather
Infrastructure
Passage
Traffic
Emergency
```

Problem solved.

---

## Final frame

```text
CIVIS

4 capabilities
        ↓
5 capabilities
```

Then:

> **“The city faced a problem it had never seen before — so its intelligence adapted.”**

---

# PHASE 22 — Documentation & Evidence

### Time: 3–5 hours

Create:

```text
docs/
├── architecture.md
├── capability-lifecycle.md
├── governance.md
├── evaluation.md
├── gemini-integration.md
└── limitations.md
```

And:

```text
evidence/
├── evaluation-results.json
├── provenance.json
└── screenshots/
```

---

# PHASE 23 — README

Structure:

```text
CIVIS
Cities that can adapt.

01 — The Problem
02 — The Insight
03 — The Solution
04 — The Four-Act Story
05 — How CIVIS Works
06 — Architecture
07 — Gemini Integration
08 — Capability Lifecycle
09 — Evaluation
10 — Governance
11 — Multi-Agent Coordination
12 — Demo
13 — Technical Stack
14 — Limitations
15 — Future
```

Don't claim:

> "CIVIS is the first..."

Don't claim:

> "No other system can..."

Instead describe exactly what you built.

---

# PHASE 24 — What We Explicitly DO NOT Build

This is the **build freeze**.

Do not add:

❌ Agent marketplace
❌ Token economy
❌ x402
❌ Blockchain
❌ NFTs
❌ Mobile app
❌ Voice
❌ 30 agents
❌ Real emergency dispatch
❌ Real traffic control
❌ Real municipal infrastructure integration
❌ Arbitrary generated code execution
❌ Multi-model routing
❌ Custom A2A protocol
❌ Multi-city support
❌ 3D digital twin
❌ Giant analytics dashboard

These are distractions.

---

# The Exact Build Sequence

If you want the shortest practical route, follow this:

### BLOCK 1

```text
Foundation
↓
Database
↓
Weather Agent
↓
Traffic Agent
↓
Infrastructure Agent
↓
Emergency Agent
↓
KNOWN PROBLEM WORKS
```

### BLOCK 2

```text
Gemini
↓
Incident Understanding
↓
Capability Decomposition
↓
Capability Registry
↓
UNKNOWN PROBLEM DETECTED
```

### BLOCK 3

```text
Adaptation Engine
↓
Passage Agent
↓
Generic Runtime
↓
Evaluation
↓
FAIL
↓
REPAIR
↓
PASS
```

### BLOCK 4

```text
Governance
↓
ALLOW/DENY
↓
Authority
↓
Swarm
↓
Resolution
↓
Provenance
```

### BLOCK 5

```text
CIVIS UI
↓
Animations
↓
Realtime Timeline
↓
React Flow
↓
Demo Mode
```

### BLOCK 6

```text
Testing
↓
Hardening
↓
README
↓
Evidence
↓
90–120 sec video
↓
SUBMIT
```

---

# Your Definition of Done

CIVIS is ready when this exact sentence can be demonstrated technically:

> **A city encounters a problem its existing AI workforce cannot solve; CIVIS identifies the missing capability, creates a specialist, tests it, catches a failure, repairs it, grants only bounded authority, deploys it alongside the existing workforce, solves the problem, and permanently adds that capability to the city's workforce.**

If you can demonstrate **that one loop cleanly**, you have the project.

And this is now the central product distinction:

```text
Traditional AI workforce
        ↓
Knows capabilities in advance


CIVIS
        ↓
Encounters problem
        ↓
Discovers what it lacks
        ↓
Develops capability
        ↓
Proves capability
        ↓
Governs capability
        ↓
Adds capability
        ↓
Becomes more capable
```

**That is what we build. No more changing the idea.**
