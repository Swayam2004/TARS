import { motion, AnimatePresence } from 'framer-motion';
import { useTarsStore } from '../../store/useTarsStore';

const STATUS_ICON  = { pending: '○', running: '◌', SUCCESS: '✓', WARNING: '⚠', FAILED: '✗', awaiting: '⏸' };
const STATUS_COLOR = {
  pending:  'text-zinc-600',
  running:  'text-brand-400',
  SUCCESS:  'text-emerald-400',
  WARNING:  'text-amber-400',
  FAILED:   'text-red-400',
  awaiting: 'text-amber-300',
};
const TYPE_DOT = {
  COMMAND:  'bg-violet-500',
  ASSERT:   'bg-blue-500',
  DECISION: 'bg-amber-500',
  WAIT:     'bg-zinc-600',
};

export default function DryRunViewer({ allSteps }) {
  const executionState = useTarsStore(s => s.executionState);
  const executing      = useTarsStore(s => s.executing);

  if (!executionState && !allSteps?.length) return null;

  const execSteps = executionState?.steps || [];

  // Merge allSteps with execution results
  const merged = (allSteps || []).map(step => {
    const exec = execSteps.find(e => e.stepId === step.id);
    const isCurrent = executionState?.currentStepId === step.id;
    const status = exec?.status || (isCurrent ? 'running' : 'pending');
    return { ...step, execStatus: status, output: exec?.output, isCurrent };
  });

  const completedCount = execSteps.filter(s => ['SUCCESS','WARNING','FAILED'].includes(s.status)).length;

  return (
    <div className="space-y-3">
      {/* Run header */}
      {executionState && (
        <div className="card p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${executing ? 'bg-brand-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div>
              <div className="text-sm font-medium text-white">
                {executing ? 'Dry Run in Progress…' : `Dry Run ${executionState.status}`}
              </div>
              <div className="text-xs text-zinc-500">
                {completedCount} / {executionState.totalSteps} steps · Mode: DRY-RUN (no real execution)
              </div>
            </div>
          </div>
          {executionState.status && !executing && (
            <span className={`badge ${executionState.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
              {executionState.status}
            </span>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-1">
        {merged.map((step, i) => (
          <motion.div
            key={step.id}
            layout
            className={`
              relative rounded-lg border transition-all duration-300 overflow-hidden
              ${step.isCurrent ? 'border-brand-500/50 bg-brand-900/10 scan-line' : ''}
              ${step.execStatus === 'SUCCESS'  ? 'border-emerald-700/20 bg-emerald-900/5' : ''}
              ${step.execStatus === 'WARNING'  ? 'border-amber-700/30 bg-amber-900/5' : ''}
              ${step.execStatus === 'awaiting' ? 'border-amber-500/50 bg-amber-900/10' : ''}
              ${step.execStatus === 'pending'  ? 'border-white/[0.04] bg-transparent' : ''}
            `}
          >
            <div className="flex items-start gap-3 p-3">
              {/* Step number */}
              <div className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center
                              text-[9px] text-zinc-600 font-mono shrink-0 mt-0.5">
                {step.order}
              </div>

              {/* Type dot */}
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[step.type] || 'bg-zinc-600'}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${step.execStatus === 'pending' ? 'text-zinc-500' : 'text-white'}`}>
                    {step.description}
                  </span>
                  {step.requires_approval && step.execStatus === 'awaiting' && (
                    <span className="badge badge-warning text-[10px] animate-pulse">awaiting approval</span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-zinc-600 truncate">{step.cmd}</div>

                {/* Output */}
                <AnimatePresence>
                  {step.output && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2 terminal text-[10px] leading-relaxed max-h-16 overflow-hidden"
                    >
                      {step.output}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status icon */}
              <div className={`text-sm shrink-0 ${STATUS_COLOR[step.execStatus] || 'text-zinc-600'}`}>
                {step.execStatus === 'running'
                  ? <span className="animate-spin inline-block">◌</span>
                  : STATUS_ICON[step.execStatus] || '○'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
