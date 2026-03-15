import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database.js';
import { validateRunbook } from '../agents/validator.js';

const router = express.Router();

// POST /api/runbooks/:id/validate
router.post('/:id/validate', (req, res) => {
  const db = getDb();
  const runbook = db.prepare('SELECT * FROM runbooks WHERE id = ?').get(req.params.id);
  if (!runbook) return res.status(404).json({ error: 'Runbook not found' });

  const result = validateRunbook(runbook);

  // Persist validation result
  const valId = `val-${uuidv4().slice(0, 8)}`;
  db.prepare(
    `INSERT INTO validation_results (id, runbook_id, checked_at, status, violations_json)
     VALUES (?, ?, ?, ?, ?)`
  ).run(valId, runbook.id, new Date().toISOString(), result.status, JSON.stringify(result.violations));

  // Auto-update runbook status if fully passed
  if (result.status === 'PASSED') {
    db.prepare("UPDATE runbooks SET status = 'VALIDATED' WHERE id = ?").run(runbook.id);
  }

  res.json({
    validationId: valId,
    runbookId: runbook.id,
    ...result,
  });
});

export default router;
