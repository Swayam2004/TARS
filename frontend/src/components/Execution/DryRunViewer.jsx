import { motion, AnimatePresence } from 'framer-motion';
import { useTarsStore } from '../../store/useTarsStore';

const TYPE_DOT = {
  COMMAND:  'bg-violet-500',
  ASSERT:   'bg-blue-500',
  DECISION: 'bg-amber-500',
  WAIT:     'bg-slate-400',
};

export default function DryRunViewer({ allSteps }) {
  const executionState = useTarsStore(s => s.executionState);
  const executing      = useTarsStore(s => s.executing);

  if (!executionState && !allSteps?.length) return null;

  const execSteps = executionState?.steps || [];
  const completedCount = execSteps.filter(s =>
    ['SUCCESS','WARNING','FAILED'].includes(s.status)
  ).length;

  const merged = (allSteps || []).map(step => {
    const exec      = execSteps.find(e => e.stepId === step.id);
    const isCurrent = executionState?.currentStepId === step.id;
    const status    = exec?.status || (isCurrent ? 'running' : 'pending');
    return { ...step, execStatus: status, output: exec?.output, isCurrent };
  });

  return (
    <div className="space-y-4">
      {/* Run header */}
      {executionState && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0
              ${executing ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`}
            />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {executing ? 'Dry Run in Progress…' : `Dry Run ${executionState.status}`}
              </div>
              <div className="text-xs text-slate-400">
                {completedCount} / {executionState.totalSteps} steps · Mode: DRY-RUN
              </div>
            </div>
          </div>
          {!executing && executionState.status && (
            <span className={`badge ${executionState.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
              {executionState.status}
            </span>
          )}
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-2">
        {merged.map((step, i) => {
          const s = step.execStatus;
          const borderClass =
            s === 'running'  ? 'border-primary/40 bg-primary/[0.02]'    :
            s === 'SUCCESS'  ? 'border-emerald-200 bg-emerald-50/40'     :
            s === 'WARNING'  ? 'border-amber-200   bg-amber-50/40'       :
            s === 'FAILED'   ? 'border-red-200     bg-red-50/40'         :
            s === 'awaiting' ? 'border-amber-300   bg-amber-50/60'       :
                               'border-slate-200   bg-white';

          return (
            <motion.div
              key={step.id}
              layout
              className={`relative rounded-xl border ${borderClass}
                          overflow-hidden transition-all duration-300`}
            >
              <div className="flex items-start gap-3 p-4">
                {/* Step number */}
                <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center
                                text-[10px] text-slate-500 font-mono shrink-0 mt-0.5">
                  {step.order}
                </div>

                {/* Type dot */}
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[step.type] || 'bg-slate-400'}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${s === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                    {step.description}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate mt-0.5">{step.cmd}</div>

                  <AnimatePresence>
                    {step.output && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-2 rounded-lg overflow-hidden"
                      >
                        <div className="bg-slate-950 text-emerald-400 font-mono text-[10px]
                                        p-3 leading-relaxed max-h-16 overflow-hidden">
                          {step.output}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Status icon */}
                <div className="shrink-0">
                  {s === 'running'  && <span className="material-symbols-outlined text-primary text-[18px] animate-spin">sync</span>}
                  {s === 'SUCCESS'  && <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>}
                  {s === 'WARNING'  && <span className="material-symbols-outlined text-amber-500  text-[18px]">warning</span>}
                  {s === 'FAILED'   && <span className="material-symbols-outlined text-red-500    text-[18px]">error</span>}
                  {s === 'awaiting' && <span className="material-symbols-outlined text-amber-500  text-[18px] animate-pulse">pause_circle</span>}
                  {s === 'pending'  && <span className="material-symbols-outlined text-slate-300  text-[18px]">radio_button_unchecked</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
