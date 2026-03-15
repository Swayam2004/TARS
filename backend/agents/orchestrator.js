import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const STEP_DURATION_MS = 1200; // ms per step in dry-run (tweak for demo pacing)

/**
 * Agent 5 — Execution Orchestrator
 * Runs a dry-run simulation of a runbook, emitting SSE events per step.
 * @param {string} runbookId
 * @param {Function} emit  - SSE emitter: emit(event, data)
 */
export async function runDryRun(runbookId, emit) {
  const db = getDb();
  const runbook = db.prepare('SELECT * FROM runbooks WHERE id = ?').get(runbookId);

  if (!runbook) throw new Error(`Runbook ${runbookId} not found`);

  const steps = JSON.parse(runbook.steps_json || '[]');
  const runId = `run-${uuidv4().slice(0, 8)}`;
  const startedAt = new Date().toISOString();

  // Insert execution run record
  db.prepare(
    `INSERT INTO execution_runs (id, runbook_id, status, mode, triggered_by, started_at)
     VALUES (?, ?, 'RUNNING', 'dry-run', 'demo-user', ?)`
  ).run(runId, runbookId, startedAt);

  emit('run_start', {
    runId,
    runbookId,
    runbookName: runbook.name,
    totalSteps: steps.length,
    mode: 'dry-run',
    startedAt,
  });

  const stepResults = [];
  let overallStatus = 'SUCCESS';

  for (const step of steps) {
    // Signal step is starting
    emit('step_start', {
      runId,
      stepId: step.id,
      order: step.order,
      type: step.type,
      description: step.description,
      cmd: step.cmd,
      requires_approval: step.requires_approval,
    });

    // Approval gate — pause and wait for frontend to resume
    if (step.requires_approval) {
      emit('step_awaiting_approval', {
        runId,
        stepId: step.id,
        description: step.description,
        message: `Step ${step.order} requires human approval before proceeding.`,
      });

      // In dry-run, we auto-approve after a pause (real mode would await webhook)
      await sleep(2000);

      emit('step_approved', { runId, stepId: step.id, approvedBy: 'demo-user' });
    }

    // Simulate step execution
    await sleep(STEP_DURATION_MS);

    // 95% success rate in dry-run (occasional simulated warning for realism)
    const success = Math.random() > 0.05;
    const status = success ? 'SUCCESS' : 'WARNING';

    const result = {
      runId,
      stepId:   step.id,
      order:    step.order,
      type:     step.type,
      description: step.description,
      status,
      output:   simulateOutput(step, success),
      duration_ms: STEP_DURATION_MS,
    };

    stepResults.push(result);
    emit('step_complete', result);

    if (!success) overallStatus = 'WARNING';
  }

  const completedAt = new Date().toISOString();

  // Update run record
  db.prepare(
    `UPDATE execution_runs SET status = ?, completed_at = ?, step_results_json = ? WHERE id = ?`
  ).run(overallStatus, completedAt, JSON.stringify(stepResults), runId);

  // Update knowledge base
  const kb = db.prepare('SELECT * FROM knowledge_entries WHERE runbook_id = ?').get(runbookId);
  if (kb) {
    const succeeded = overallStatus === 'SUCCESS' ? 1 : 0;
    db.prepare(
      `UPDATE knowledge_entries
       SET success_count = success_count + ?,
           failure_count = failure_count + ?,
           last_run_at = ?
       WHERE runbook_id = ?`
    ).run(succeeded, 1 - succeeded, completedAt, runbookId);
  } else {
    db.prepare(
      `INSERT INTO knowledge_entries (id, runbook_id, success_count, failure_count, avg_duration, last_run_at)
       VALUES (?, ?, ?, 0, 0, ?)`
    ).run(`kb-${uuidv4().slice(0, 8)}`, runbookId, 1, completedAt);
  }

  emit('run_complete', {
    runId,
    status: overallStatus,
    totalSteps: steps.length,
    completedAt,
    duration_ms: steps.length * STEP_DURATION_MS,
  });

  return { runId, status: overallStatus };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function simulateOutput(step, success) {
  if (!success) return `[DRY-RUN] WARNING: Step completed with non-zero exit code (simulated)`;

  const outputs = {
    COMMAND: `[DRY-RUN] $ ${step.cmd || '...'}\n✓ Command executed successfully`,
    ASSERT:  `[DRY-RUN] Assertion check passed — condition met`,
    DECISION:`[DRY-RUN] Condition evaluated → taking TRUE branch`,
    WAIT:    `[DRY-RUN] Wait condition satisfied — proceeding`,
  };
  return outputs[step.type] || `[DRY-RUN] Step completed`;
}
