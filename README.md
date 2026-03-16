# TARS — Task Automation & Runbook Synthesis

> **Deloitte Hacksplosion 2026** · Built on Deloitte's GenW Platform · OUTR Team

TARS converts messy operational documents (PDFs, Word files, emails) into validated, executable runbooks using a multi-agent AI pipeline — then lets you run them with human oversight built in.

**The problem in one line:** Engineers waste hours during incidents manually interpreting scattered procedure docs, risking compliance mistakes under pressure.

**The fix:** Upload a doc → AI extracts steps → policy agent validates → dry-run executes safely.

---

## How It Works
```
Upload Doc → Ingest → Extract Steps → Build DAG → Validate → Dry Run → Learn
```

1. **Ingest** — Parses PDF, DOCX, or Markdown via GenW RealmAI
2. **Synthesize** — 3 AI agents (Step Extractor, Dependency Analyzer, Parameter Mapper) convert raw text into a structured JSON runbook
3. **Validate** — Policy engine checks every step against 10 compliance rules before anything runs
4. **Execute** — Dry-run mode animates execution step-by-step, pausing for human approval at high-risk actions
5. **Learn** — Every run updates the knowledge base with success rates and MTTR metrics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Zustand |
| Backend | Node.js, Express, Server-Sent Events (SSE) |
| AI | OpenAI GPT-4o (primary) · Anthropic Claude (fallback) |
| Database | SQLite via `better-sqlite3` |
| Doc Parsing | `pdf-parse`, `mammoth` (DOCX) |
| GenW Platform | RealmAI · Agent Builder · Playground · App Maker |

---

## Project Structure
```
tars/
├── backend/
│   ├── agents/          # ingestion, stepExtractor, dependencyAnalyzer,
│   │                    #   paramMapper, validator, orchestrator
│   ├── services/        # llmClient.js — OpenAI + Claude fallback
│   ├── routes/          # documents, runbooks, validation, execution, analytics
│   ├── db/              # SQLite schema + seed data
│   └── policies/        # rules.json — 10 compliance rules
└── frontend/
    ├── components/      # Landing, Pipeline, Runbook, Validation,
    │                    #   Execution, Dashboard
    ├── pages/           # Home, Synthesize, Validate, Execute,
    │                    #   Dashboard, Library
    └── store/           # Zustand global state
```

---

## Quick Start

**Prerequisites:** Node.js 18+, an OpenAI API key
```bash
# 1. Clone and configure
git clone <repo-url> && cd tars
cp .env.example backend/.env
# Add OPENAI_API_KEY to backend/.env

# 2. Install
cd backend  && npm install
cd ../frontend && npm install

# 3. Seed the database (pre-loads 4 runbooks + demo data)
cd ../backend && npm run seed

# 4. Run (two terminals)
cd backend  && npm run dev   # → http://localhost:3001
cd frontend && npm run dev   # → http://localhost:5173
```

---

## Key Features

- **Multi-agent synthesis** — Three specialized AI agents work in sequence, each with a single responsibility (extract → analyze → map), reducing hallucination risk
- **Pre-execution policy validation** — Catches compliance violations *before* anything runs, not after
- **Human-in-the-loop** — Approval gates pause execution at high-risk steps; no automated command runs without a human confirm
- **Live pipeline streaming** — Server-Sent Events stream agent progress to the UI in real time — no polling, no page refreshes
- **OpenAI → Claude fallback** — If the primary LLM fails mid-demo, the system transparently retries with Claude
- **Pre-seeded dashboard** — 4 runbooks, 10 execution runs, and knowledge base entries loaded on first launch so the demo starts with real data

---

## Demo Flow (7 minutes)

| Step | What the judge sees |
|---|---|
| **Dashboard** | Pre-populated metrics — 4 runbooks, 80% success rate, execution history |
| **Upload** | Drag `Database_Failover_Procedure.pdf` → 4 agent cards animate live |
| **Runbook** | 8 structured steps appear — types, commands, parameter badges |
| **Validate** | Policy engine flags Step 4 (P-102: VP approval missing) → fix → all green |
| **Dry Run** | Steps execute one-by-one → approval modal pauses at Step 2 → judge clicks Approve → 8/8 SUCCESS |

---

## Environment Variables
```env
OPENAI_API_KEY=sk-...          # Required
ANTHROPIC_API_KEY=sk-ant-...   # Optional — used as fallback only
PORT=3001
```

---

## Built for Deloitte Hacksplosion 2026

TARS is designed to run natively on **Deloitte's GenW Platform** — the final production version uses GenW Agent Builder for multi-agent orchestration, GenW RealmAI for document intelligence, and GenW Playground for analytics dashboards. This prototype demonstrates the same logic as a standalone Node.js + React application for evaluation purposes.

---

*Team Coopers - OUTR, Bhubaneswar, Odisha*
