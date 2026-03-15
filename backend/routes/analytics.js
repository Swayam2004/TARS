import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

// GET /api/analytics/dashboard — all KPIs in one call
router.get('/dashboard', (req, res) => {
  const db = getDb();

  const totalRunbooks   = db.prepare('SELECT COUNT(*) as n FROM runbooks').get().n;
  const totalExecutions = db.prepare('SELECT COUNT(*) as n FROM execution_runs').get().n;
  const successfulRuns  = db.prepare("SELECT COUNT(*) as n FROM execution_runs WHERE status = 'SUCCESS'").get().n;
  const successRate     = totalExecutions > 0 ? Math.round((successfulRuns / totalExecutions) * 100) : 0;

  const violationsResolved = db.prepare(`
    SELECT COUNT(*) as n FROM validation_results WHERE status = 'PASSED'
  `).get().n;

  const statusBreakdown = db.prepare(`
    SELECT status, COUNT(*) as count FROM runbooks GROUP BY status
  `).all();

  const recentRuns = db.prepare(`
    SELECT er.id, er.status, er.mode, er.started_at, er.completed_at,
           r.name as runbook_name
    FROM execution_runs er
    JOIN runbooks r ON er.runbook_id = r.id
    ORDER BY er.started_at DESC
    LIMIT 8
  `).all();

  // Execution trend — last 7 days grouped by day
  const trend = db.prepare(`
    SELECT
      DATE(started_at) as day,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
      SUM(CASE WHEN status = 'FAILED'  THEN 1 ELSE 0 END) as failed
    FROM execution_runs
    WHERE started_at >= DATE('now', '-7 days')
    GROUP BY DATE(started_at)
    ORDER BY day ASC
  `).all();

  const topRunbooks = db.prepare(`
    SELECT r.name, r.status, ke.success_count, ke.failure_count, ke.avg_duration, ke.last_run_at
    FROM knowledge_entries ke
    JOIN runbooks r ON ke.runbook_id = r.id
    ORDER BY (ke.success_count + ke.failure_count) DESC
    LIMIT 5
  `).all();

  res.json({
    kpis: {
      totalRunbooks,
      totalExecutions,
      successRate,
      violationsResolved,
    },
    statusBreakdown,
    recentRuns,
    trend,
    topRunbooks,
  });
});

export default router;
