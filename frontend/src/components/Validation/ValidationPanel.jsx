import { motion, AnimatePresence } from 'framer-motion';

const SEV_CLASS = {
  CRITICAL: 'sev-critical',
  HIGH:     'sev-high',
  MEDIUM:   'sev-medium',
  LOW:      'sev-low',
};

const POLICY_CHECKS = [
  { id: 'P-102', label: 'VP approval gates'    },
  { id: 'P-107', label: 'No plaintext secrets' },
  { id: 'P-103', label: 'SSH audit logging'    },
  { id: 'P-105', label: 'Rollback procedure'   },
  { id: 'P-106', label: 'Smoke test present'   },
  { id: 'P-108', label: 'K8s namespace flags'  },
  { id: 'P-109', label: 'Force-delete gates'   },
  { id: 'P-110', label: 'Params documented'    },
];

export default function ValidationPanel({ result, loading }) {
  const passed     = result?.passed     || [];
  const violations = result?.violations || [];

  return (
    <div className="space-y-4">
      {/* Policy check grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card p-5">
        <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">
          Policy Engine — 10 Rules
        </div>
        <div className="grid grid-cols-2 gap-2">
          {POLICY_CHECKS.map((check, i) => {
            const isPassed   = passed.find(p => p.policy_id === check.id);
            const isViolated = violations.find(v => v.policy_id === check.id);

            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: loading ? 0 : i * 0.06 }}
                className={`
                  flex items-center gap-2 p-2.5 rounded-lg text-xs border transition-colors
                  ${isViolated ? 'bg-red-50 border-red-200'         : ''}
                  ${isPassed   ? 'bg-emerald-50 border-emerald-200' : ''}
                  ${!isPassed && !isViolated ? 'bg-slate-50 border-slate-200' : ''}
                `}
              >
                <span className="shrink-0 material-symbols-outlined text-[14px]
                  ${isPassed ? 'text-emerald-500' : isViolated ? 'text-red-500' : 'text-slate-300'}">
                  {isPassed ? 'check_circle' : isViolated ? 'cancel' : loading ? 'radio_button_unchecked' : 'remove'}
                </span>
                <span className={
                  isViolated ? 'text-red-700 font-medium' :
                  isPassed   ? 'text-emerald-700'          :
                               'text-slate-400'
                }>
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
            className="space-y-3"
          >
            <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">
              {violations.length} Violation{violations.length > 1 ? 's' : ''} Found
            </div>

            {violations.map((v, i) => (
              <motion.div
                key={v.policy_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xs font-mono font-bold">{v.policy_id}</span>
                    <span className="text-sm font-semibold text-slate-900">{v.policy_name}</span>
                  </div>
                  <span className={`badge shrink-0 ${SEV_CLASS[v.severity] || 'sev-low'}`}>
                    {v.severity}
                  </span>
                </div>

                <p className="text-xs text-red-700 mb-2 leading-relaxed">{v.reason}</p>

                {v.affected_steps?.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] text-slate-400">Affected:</span>
                    {v.affected_steps.map(s => (
                      <span key={s} className="font-mono text-[10px] px-1.5 py-0.5 bg-white
                                                rounded border border-red-200 text-red-600">{s}</span>
                    ))}
                  </div>
                )}

                <div className="text-[11px] text-slate-600 bg-white rounded-lg p-2.5 border border-red-100 leading-relaxed">
                  <span className="text-primary font-medium">Remediation: </span>
                  {v.remediation}
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
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
        >
          <span className="material-symbols-outlined text-4xl text-emerald-500 block mb-2">
            verified
          </span>
          <div className="text-emerald-700 font-semibold">All policy checks passed</div>
          <div className="text-slate-500 text-xs mt-1">{result.summary}</div>
        </motion.div>
      )}
    </div>
  );
}
