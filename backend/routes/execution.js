import express from 'express';
import { getDb } from '../db/database.js';
import { runDryRun } from '../agents/orchestrator.js';
import { sseInit } from '../middleware/sse.js';

const router = express.Router();

// GET /api/runbooks/:id/execute — SSE stream of dry-run execution
router.get('/:id/execute', async (req, res) => {
  const emit = sseInit(res);
  const db = getDb();

  try {
    const runbook = db.prepare('SELECT * FROM runbooks WHERE id = ?').get(req.params.id);
    if (!runbook) {
      emit('error', { message: 'Runbook not found' });
      return res.end();
    }
    if (!['VALIDATED', 'APPROVED'].includes(runbook.status)) {
      emit('error', { message: `Runbook must be VALIDATED before execution. Current status: ${runbook.status}` });
      return res.end();
    }

    await runDryRun(req.params.id, emit);
    res.end();
  } catch (err) {
    console.error('[Execute]', err);
    emit('error', { message: err.message });
    res.end();
  }
});

// GET /api/runbooks/:id/executions — execution history
router.get('/:id/executions', (req, res) => {
  const db = getDb();
  const runs = db.prepare(
    'SELECT * FROM execution_runs WHERE runbook_id = ? ORDER BY started_at DESC LIMIT 20'
  ).all(req.params.id);
  res.json(runs.map(r => ({
    ...r,
    step_results: r.step_results_json ? JSON.parse(r.step_results_json) : [],
  })));
});

export default router;
