import { motion, AnimatePresence } from 'framer-motion';

const SEV_CLASS = {
  CRITICAL: 'sev-critical',
  HIGH:     'sev-high',
  MEDIUM:   'sev-medium',
  LOW:      'sev-low',
};

const POLICY_CHECKS = [
  { id: 'P-102', label: 'VP approval gates'      },
  { id: 'P-107', label: 'No plaintext secrets'   },
  { id: 'P-103', label: 'SSH audit logging'       },
  { id: 'P-105', label: 'Rollback procedure'      },
  { id: 'P-106', label: 'Smoke test present'      },
  { id: 'P-108', label: 'K8s namespace flags'     },
  { id: 'P-109', label: 'Force-delete gates'      },
  { id: 'P-110', label: 'Params documented'       },
];

export default function ValidationPanel({ result, loading }) {
  const passed     = result?.passed     || [];
  const violations = result?.violations || [];

  return (
    <div className="space-y-4">
      {/* Policy check grid */}
      <div className="card p-4">
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Policy Engine — 10 Rules</div>
        <div className="grid grid-cols-2 gap-2">
          {POLICY_CHECKS.map((check, i) => {
            const isPassed   = passed.find(p => p.policy_id === check.id);
            const isViolated = violations.find(v => v.policy_id === check.id);
            const isChecking = loading;

            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: loading ? 0 : i * 0.06 }}
                className={`
                  flex items-center gap-2 p-2 rounded-lg text-xs
                  ${isViolated ? 'bg-red-900/20 border border-red-700/30'  : ''}
                  ${isPassed   ? 'bg-emerald-900/10 border border-emerald-700/20' : ''}
                  ${!isPassed && !isViolated ? 'bg-white/[0.02] border border-white/[0.06]' : ''}
                `}
              >
                <span className="shrink-0">
                  {isChecking && !isPassed && !isViolated && (
                    <span className="text-zinc-600 animate-pulse">○</span>
                  )}
                  {isPassed   && <span className="text-emerald-400">✓</span>}
                  {isViolated && <span className="text-red-400">✗</span>}
                  {!loading && !isPassed && !isViolated && <span className="text-zinc-600">—</span>}
                </span>
                <span className={isViolated ? 'text-red-300' : isPassed ? 'text-zinc-300' : 'text-zinc-500'}>
                  {check.label}
                </span>
                {isViolated && (
                  <span className={`badge ml-auto ${SEV_CLASS[isViolated.severity] || 'sev-low'}`}>
                    {isViolated.severity}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Violations */}
      <AnimatePresence>
        {violations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="text-xs uppercase tracking-widest text-zinc-500">
              {violations.length} Violation{violations.length > 1 ? 's' : ''} Found
            </div>

            {violations.map((v, i) => (
              <motion.div
                key={v.policy_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-sm p-3 border border-red-700/30 bg-red-900/10"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 text-xs font-mono">{v.policy_id}</span>
                    <span className="text-sm font-medium text-white">{v.policy_name}</span>
                  </div>
                  <span className={`badge ${SEV_CLASS[v.severity] || 'sev-low'} shrink-0`}>{v.severity}</span>
                </div>
                <p className="text-xs text-red-300 mb-2">{v.reason}</p>
                {v.affected_steps?.length > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px] text-zinc-600">Affected:</span>
                    {v.affected_steps.map(s => (
                      <span key={s} className="font-mono text-[10px] px-1.5 py-0.5 bg-white/[0.04]
                                                rounded text-zinc-400">{s}</span>
                    ))}
                  </div>
                )}
                <div className="text-[11px] text-zinc-500 bg-white/[0.03] rounded p-2 border border-white/[0.06]">
                  💡 {v.remediation}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* All passed */}
      {result?.status === 'PASSED' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-sm p-4 border border-emerald-500/30 bg-emerald-900/10 text-center"
        >
          <div className="text-2xl mb-1">✅</div>
          <div className="text-emerald-400 font-medium text-sm">All policy checks passed</div>
          <div className="text-zinc-500 text-xs mt-1">{result.summary}</div>
        </motion.div>
      )}
    </div>
  );
}
