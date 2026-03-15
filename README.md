# TARS — Task Automation & Runbook Synthesis

> Deloitte Hacksplosion 2026 · GenW Platform Prototype

## What it does

Upload any operational procedure document (PDF, DOCX, Markdown) and TARS:
1. **Ingests** — extracts raw text via OCR/parsing
2. **Extracts** — GPT-4o identifies steps, types (COMMAND/ASSERT/DECISION/WAIT), and parameters
3. **Analyzes** — builds a dependency DAG across all steps
4. **Validates** — runs 10 policy rules against the runbook before any execution
5. **Executes** — animated dry-run with human-in-the-loop approval gates
6. **Learns** — every run updates the knowledge base and dashboard metrics

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- OpenAI API key (primary)
- Anthropic API key (fallback, optional)

### 2. Environment
```bash
cp .env.example backend/.env
# Edit backend/.env and add your keys:
#   OPENAI_API_KEY=sk-...
#   ANTHROPIC_API_KEY=sk-ant-...   (optional)
```

### 3. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Seed the database
```bash
cd backend && npm run seed
```
This pre-loads 4 runbooks, 10 execution runs, and knowledge base entries
so the dashboard is populated on first launch.

### 5. Start both servers
**Terminal 1 — Backend (port 3001):**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend && npm run dev
```

Open http://localhost:5173

---

## Demo Script (7 minutes)

**1. Dashboard (30s)**
Open at `/dashboard` — show pre-populated metrics: 4 runbooks, 10 executions,
success rate, recent run history.

**2. Upload (1 min)**
Drag `data/sample_docs/Database_Failover_Procedure.pdf` onto the drop zone.
Watch the 4 agent cards light up in sequence with live SSE log lines.

**3. Runbook Viewer (2 min)**
Once synthesis completes, the structured runbook appears — step types, commands,
dependency parameters, approval gate badges.

**4. Validation (1 min)**
Click Validate. Policy checks animate one by one.
Point out: P-102 flags Step 4 (DB promote without VP approval gate).
Click Re-validate after the auto-fix — all green.

**5. Dry Run (2 min)**
Click Dry Run. Steps execute one-by-one with live output.
Step 2 triggers the approval modal — judge clicks Approve.
Execution completes: 8/8 SUCCESS. Dashboard counter increments.

---

## Project Structure

```
tars/
├── backend/
│   ├── agents/          # 5 AI agents (ingestion, extractor, analyzer, mapper, orchestrator)
│   ├── services/        # LLM client (OpenAI primary, Claude fallback)
│   ├── routes/          # Express API routes
│   ├── db/              # SQLite schema + seed
│   ├── policies/        # rules.json — 10 policy rules
│   └── index.js         # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Upload, Pipeline, Runbook, Validation, Execution, Dashboard
│   │   ├── pages/       # Home, Synthesize, Validate, Execute, Dashboard, Library
│   │   ├── store/       # Zustand global state
│   │   └── api/         # Axios client
│   └── vite.config.js
└── data/
    └── sample_docs/     # Demo PDFs
```

---

## Key Code Snippets (for PPT)

### LLM Client with Fallback
`backend/services/llmClient.js` — OpenAI primary, Claude fallback, JSON mode enforced.

### SSE Pipeline Stream
`backend/routes/documents.js` — real-time agent events via Server-Sent Events.

### Frontend SSE Hook
`frontend/src/components/Pipeline/useSSEPipeline.js` — EventSource → Zustand store.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Zustand, Recharts |
| Backend | Node.js, Express, Multer, SSE |
| AI | OpenAI GPT-4o (primary), Anthropic Claude (fallback) |
| Database | SQLite via better-sqlite3 |
| Parsing | pdf-parse, mammoth (DOCX) |

---

Built with ❤ for Deloitte Hacksplosion 2026 — OUTR Team
