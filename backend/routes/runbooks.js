import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

// GET /api/runbooks — list all runbooks
router.get('/', (req, res) => {
  const db = getDb();
  const runbooks = db.prepare(`
    SELECT r.id, r.name, r.status, r.created_at, r.version,
           d.filename as source_doc,
           (SELECT COUNT(*) FROM execution_runs WHERE runbook_id = r.id) as run_count
    FROM runbooks r
    LEFT JOIN documents d ON r.source_doc_id = d.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(runbooks);
});

// GET /api/runbooks/:id — full runbook detail
router.get('/:id', (req, res) => {
  const db = getDb();
  const runbook = db.prepare('SELECT * FROM runbooks WHERE id = ?').get(req.params.id);
  if (!runbook) return res.status(404).json({ error: 'Runbook not found' });

  runbook.steps  = JSON.parse(runbook.steps_json  || '[]');
  runbook.dag    = JSON.parse(runbook.dag_json     || '{}');
  runbook.params = JSON.parse(runbook.params_json  || '[]');
  delete runbook.steps_json;
  delete runbook.dag_json;
  delete runbook.params_json;

  res.json(runbook);
});

// PATCH /api/runbooks/:id/status — update status (VALIDATED → APPROVED etc.)
router.patch('/:id/status', (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const allowed = ['DRAFT', 'VALIDATED', 'APPROVED', 'DEPRECATED'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  db.prepare('UPDATE runbooks SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, status });
});

// GET /api/runbooks/:id/executions — run history for a runbook
router.get('/:id/executions', (req, res) => {
  const db = getDb();
  const runs = db.prepare(
    'SELECT * FROM execution_runs WHERE runbook_id = ? ORDER BY started_at DESC LIMIT 20'
  ).all(req.params.id);
  res.json(runs);
});

export default router;
