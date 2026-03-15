-- Documents: source files uploaded by users
CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,
  filename    TEXT NOT NULL,
  format      TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  raw_text    TEXT,
  user_id     TEXT DEFAULT 'demo-user',
  file_path   TEXT
);

-- Runbooks: generated from documents
CREATE TABLE IF NOT EXISTS runbooks (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'DRAFT',
  source_doc_id TEXT REFERENCES documents(id),
  created_at    TEXT NOT NULL,
  version       INTEGER DEFAULT 1,
  steps_json    TEXT,
  dag_json      TEXT,
  params_json   TEXT
);

-- Policies: validation rules (also seeded from rules.json)
CREATE TABLE IF NOT EXISTS policies (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  rule_type       TEXT NOT NULL,
  constraint_expr TEXT,
  severity        TEXT NOT NULL,
  applies_to      TEXT DEFAULT 'all'
);

-- Execution runs
CREATE TABLE IF NOT EXISTS execution_runs (
  id          TEXT PRIMARY KEY,
  runbook_id  TEXT REFERENCES runbooks(id),
  status      TEXT NOT NULL DEFAULT 'PENDING',
  mode        TEXT NOT NULL DEFAULT 'dry-run',
  triggered_by TEXT DEFAULT 'demo-user',
  started_at  TEXT,
  completed_at TEXT,
  step_results_json TEXT
);

-- Validation results
CREATE TABLE IF NOT EXISTS validation_results (
  id          TEXT PRIMARY KEY,
  runbook_id  TEXT REFERENCES runbooks(id),
  checked_at  TEXT NOT NULL,
  status      TEXT NOT NULL,
  violations_json TEXT
);

-- Knowledge base: execution outcomes
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id            TEXT PRIMARY KEY,
  runbook_id    TEXT REFERENCES runbooks(id),
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_duration  REAL DEFAULT 0,
  last_run_at   TEXT
);
