# CIVIS — Cities that can adapt.

> When a city's AI workforce encounters a problem it cannot solve, CIVIS identifies the missing capability, creates a specialist, tests it, catches its own failures, repairs them, grants bounded authority, and permanently grows the city's intelligence.

## Demo

**Live**: [civis.vercel.app](https://civis.vercel.app)  
**API**: [civis-api.railway.app](https://civis-api.railway.app/health)

Press **RUN DEMO** — the full 4-act story runs in ~90 seconds.

---

## How to Run Locally

```bash
# 1. Clone
git clone https://github.com/your-org/civis.git
cd civis

# 2. Configure
cp .env.example .env
# Set GEMINI_API_KEY in .env

# 3. Start backend (PostgreSQL + FastAPI)
docker compose up

# 4. Start frontend
cd apps/web
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000 → Click **RUN DEMO**.

---

## Architecture

```
Next.js 14 (Vercel)  ──SSE──▶  FastAPI (Railway)  ──▶  PostgreSQL
                                      │
                               Gemini 2.5 Flash/Pro
                               GenericAgentRuntime
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, React Flow, Framer Motion |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL 15 |
| AI | Google Gemini 2.5 Flash + 2.5 Pro |
| Realtime | Server-Sent Events (SSE) |
| Deploy | Vercel + Railway |

---

*Derived from [AgentVerse](https://github.com/Ritinpaul/AgentVerse) agent runtime patterns.*
