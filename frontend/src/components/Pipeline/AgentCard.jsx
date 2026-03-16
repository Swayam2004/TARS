import { motion, AnimatePresence } from 'framer-motion';

const AGENT_META = {
  ingestion:           { icon: 'download',      label: 'Ingestion Agent',      desc: 'PDF / DOCX parsing'   },
  step_extractor:      { icon: 'search',         label: 'Step Extractor',       desc: 'GPT-4o synthesis'     },
  dependency_analyzer: { icon: 'account_tree',   label: 'Dependency Analyzer',  desc: 'DAG builder'          },
  param_mapper:        { icon: 'tune',           label: 'Parameter Mapper',     desc: 'Input extraction'     },
};

export default function AgentCard({ agentKey, state }) {
  const meta   = AGENT_META[agentKey] || { icon: 'smart_toy', label: agentKey, desc: '' };
  const status = state?.status || 'idle';

  const borderClass = {
    idle:     'border-slate-200',
    running:  'border-primary/50',
    complete: 'border-emerald-300',
    error:    'border-red-300',
  }[status] || 'border-slate-200';

  const bgClass = {
    idle:     'bg-white',
    running:  'bg-primary/[0.02]',
    complete: 'bg-emerald-50/50',
    error:    'bg-red-50/50',
  }[status] || 'bg-white';

  return (
    <motion.div
      layout
      className={`rounded-xl border ${borderClass} ${bgClass} p-4 shadow-card transition-colors duration-300`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-9 h-9 rounded-lg flex items-center justify-center shrink-0
          ${status === 'running'  ? 'bg-primary/10 agent-active' : ''}
          ${status === 'complete' ? 'bg-emerald-100'             : ''}
          ${status === 'idle'     ? 'bg-slate-100'               : ''}
          ${status === 'error'    ? 'bg-red-100'                 : ''}
        `}>
          <span className={`material-symbols-outlined text-[18px]
            ${status === 'running'  ? 'text-primary animate-spin' : ''}
            ${status === 'complete' ? 'text-emerald-600'          : ''}
            ${status === 'idle'     ? 'text-slate-400'            : ''}
            ${status === 'error'    ? 'text-red-500'              : ''}
          `}>
            {status === 'running' ? 'sync' : meta.icon}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
          <div className="text-xs text-slate-400">{meta.desc}</div>
        </div>

        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full shrink-0
          ${status === 'idle'     ? 'bg-slate-300'           : ''}
          ${status === 'running'  ? 'bg-primary animate-pulse': ''}
          ${status === 'complete' ? 'bg-emerald-500'          : ''}
          ${status === 'error'    ? 'bg-red-500'              : ''}
        `} />
      </div>

      {/* Message */}
      <AnimatePresence>
        {state?.message && (
          <motion.p
            key={state.message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-slate-500 leading-relaxed"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Running progress bar */}
      {status === 'running' && (
        <div className="mt-3 h-0.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Scrolling log lines */}
      {status === 'running' && state?.logs?.length > 0 && (
        <div className="mt-2 font-mono text-[10px] text-slate-400 space-y-0.5 max-h-12 overflow-hidden">
          {state.logs.slice(-3).map((log, i) => (
            <div key={i} className="truncate">› {log}</div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
