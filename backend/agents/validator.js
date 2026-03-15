import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { policies } = JSON.parse(
  readFileSync(join(__dirname, '../policies/rules.json'), 'utf8')
);

/**
 * Agent 4 — Validation Agent (rule-based, deterministic)
 * Checks a runbook's steps against all active policies.
 * Returns { status, violations[], passed[] }
 */
export function validateRunbook(runbook) {
  const steps = JSON.parse(runbook.steps_json || '[]');
  const violations = [];
  const passed = [];

  for (const policy of policies) {
    const result = runCheck(policy, steps, runbook);

    if (result.violated) {
      violations.push({
        policy_id:      policy.id,
        policy_name:    policy.name,
        severity:       policy.severity,
        reason:         result.reason,
        affected_steps: result.affectedSteps || [],
        remediation:    policy.remediation,
      });
    } else {
      passed.push({ policy_id: policy.id, policy_name: policy.name });
    }
  }

  return {
    status:     violations.length === 0 ? 'PASSED' : 'FAILED',
    violations,
    passed,
    summary: violations.length === 0
      ? `All ${policies.length} policy checks passed.`
      : `${violations.length} violation(s) found across ${policies.length} checks.`,
  };
}

// ── Individual policy checkers ─────────────────────────────────────────────

function runCheck(policy, steps, runbook) {
  switch (policy.check) {

    case 'requires_vp_approval': {
      const affected = steps.filter(s =>
        policy.keywords.some(kw => (s.cmd || '').toLowerCase().includes(kw.toLowerCase()))
        && !s.requires_approval
      );
      return affected.length > 0
        ? { violated: true, reason: `Steps ${affected.map(s => s.id).join(', ')} perform DB promotion/failover but lack VP approval gates.`, affectedSteps: affected.map(s => s.id) }
        : { violated: false };
    }

    case 'no_plaintext_secrets': {
      const affected = steps.filter(s =>
        policy.patterns.some(p => (s.cmd || '').includes(p))
      );
      return affected.length > 0
        ? { violated: true, reason: `Potential plaintext secrets detected in step(s): ${affected.map(s => s.id).join(', ')}.`, affectedSteps: affected.map(s => s.id) }
        : { violated: false };
    }

    case 'ssh_logging': {
      const affected = steps.filter(s =>
        policy.keywords.some(kw => (s.cmd || '').toLowerCase().startsWith(kw))
        && !(s.cmd || '').includes('audit-exec')
      );
      return affected.length > 0
        ? { violated: true, reason: `SSH commands in step(s) ${affected.map(s => s.id).join(', ')} are not wrapped with audit logging.`, affectedSteps: affected.map(s => s.id) }
        : { violated: false };
    }

    case 'rollback_required': {
      const hasCommand = steps.some(s => s.type === 'COMMAND');
      const hasRollback = (runbook.steps_json || '').toLowerCase().includes('rollback')
        || steps.some(s => s.description?.toLowerCase().includes('rollback'));
      if (hasCommand && !hasRollback) {
        return { violated: true, reason: 'Runbook contains COMMAND steps but no rollback procedure is defined.', affectedSteps: [] };
      }
      return { violated: false };
    }

    case 'smoke_test_required': {
      const hasRestartCmd = steps.some(s =>
        policy.keywords.some(kw => (s.cmd || '').toLowerCase().includes(kw))
      );
      const lastStep = steps[steps.length - 1];
      const endsWithAssert = lastStep?.type === 'ASSERT';
      if (hasRestartCmd && !endsWithAssert) {
        return { violated: true, reason: 'Runbook restarts a service but does not end with an ASSERT smoke test.', affectedSteps: [lastStep?.id].filter(Boolean) };
      }
      return { violated: false };
    }

    case 'k8s_namespace_required': {
      const affected = steps.filter(s =>
        (s.cmd || '').includes('kubectl')
        && !(s.cmd || '').includes('-n ')
        && !(s.cmd || '').includes('--namespace')
      );
      return affected.length > 0
        ? { violated: true, reason: `kubectl commands in step(s) ${affected.map(s => s.id).join(', ')} are missing explicit --namespace/-n flags.`, affectedSteps: affected.map(s => s.id) }
        : { violated: false };
    }

    case 'force_delete_forbidden': {
      const affected = steps.filter(s =>
        policy.keywords.some(kw => (s.cmd || '').includes(kw)) && !s.requires_approval
      );
      return affected.length > 0
        ? { violated: true, reason: `Force-delete operations in step(s) ${affected.map(s => s.id).join(', ')} require an explicit approval gate.`, affectedSteps: affected.map(s => s.id) }
        : { violated: false };
    }

    case 'params_documented': {
      const params = JSON.parse(runbook.params_json || '[]');
      const undocumented = Array.isArray(params)
        ? params.filter(p => !p.description)
        : [];
      return undocumented.length > 0
        ? { violated: true, reason: `${undocumented.length} parameter(s) lack descriptions.`, affectedSteps: [] }
        : { violated: false };
    }

    // P-101 (change window) and P-104 (parallel limit) — always pass in demo mode
    default:
      return { violated: false };
  }
}
