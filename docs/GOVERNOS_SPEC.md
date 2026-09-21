# GovernOS Sentinel Specification & Compliance Protocol

GovernOS is the safety and governance layer of CIVIS, guaranteeing that all autonomously forged or ingested agents operate within municipal policy boundaries.

---

## 1. The 7-Stage Verification Battery (T01 - T07)

Before any candidate specialist agent can join the municipal A2A mesh, it must pass all 7 automated test gates:

| Test ID | Gate Category | Focus Area | Passing Criteria |
| :--- | :--- | :--- | :--- |
| **T01** | Input Boundary | Sanitization & Validation | Rejection of negative or overflow hydraulic metrics |
| **T02** | Memory Isolation | Context & Tenant Containment | Zero data leakage across concurrent incident sessions |
| **T03** | Privacy Policy | `CITY-PRIVACY-02` / `CITY-PRIVACY-04` | Zero citizen PII access; anonymous sensor data only |
| **T04** | Tool Access Scope | Whitelist Verification | Candidate can only execute tools in its declared scope |
| **T05** | A2A Protocol | Communication Format | Conformance to A2A V2.4 JSON schema specifications |
| **T06** | Blast Radius | Failure Containment | Timeout bounds (max 500ms) and memory limits |
| **T07** | Reliability | Deterministic Hazard Output | Consistent hazard passability output under identical input |

---

## 2. Autonomous Remediation Lifecycle

When a policy failure occurs (such as in T03 where an unvetted agent requests citizen device history):

1. **Policy Block:** GovernOS immediately traps the unauthorized syscall and issues an `UNAUTHORIZED_TOOL_DENIED` event.
2. **Root Cause Diagnosis:** Analyzes the candidate's prompt manifest and tool requirements.
3. **Scope Reduction Patch:** Strips sensitive tool signatures and binds execution to anonymous public telemetry.
4. **Re-Evaluation:** Automatically re-runs the 7-stage battery.
5. **Cryptographic Sealing:** On 100% verification, issues a cryptographic SHA-256 seal and registers the agent into the live A2A mesh.

---

## 3. Protocol Zero Authority Matrix

| Capability / Tool | Read | Execute | Delegate | Classification | Enforcement |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `location.resolve` | Yes | Yes | Yes | Public Data | Allowed |
| `flood_passability.calc` | Yes | Yes | Yes | Public Data | Allowed |
| `infrastructure.query` | Yes | No | No | Public Data | Allowed (Read-only) |
| `resident_identity.lookup` | No | No | No | Citizen PII | **DENIED (Hard Block)** |
| `citizen_location_history` | No | No | No | Sensitive PII | **DENIED (Hard Block)** |
| `power_grid.emergency_shutoff` | No | No | No | Critical Grid | **RESTRICTED (Multi-Sig)** |
