import { motion, AnimatePresence } from 'framer-motion';

const AGENT_META = {
  ingestion:           { icon: '📥', label: 'Ingestion Agent',      desc: 'PDF/DOCX parsing' },
  step_extractor:      { icon: '🔍', label: 'Step Extractor',       desc: 'GPT-4o synthesis' },
  dependency_analyzer: { icon: '🕸️',  label: 'Dependency Analyzer', desc: 'DAG builder' },
  param_mapper:        { icon: '🗂️',  label: 'Parameter Mapper',    desc: 'Input extraction' },
};

export default function AgentCard({ agentKey, state }) {
  const meta   = AGENT_META[agentKey] || { icon: '🤖', label: agentKey, desc: '' };
  const status = state?.status || 'idle';

  const borderColor = {
    idle:     'border-white/[0.06]',
    running:  'border-brand-500/60',
    complete: 'border-emerald-500/40',
    error:    'border-red-500/40',
  }[status];

  return (
    <motion.div
      layout
      className={`card p-4 border ${borderColor} transition-colors duration-300`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0
          ${status === 'running'  ? 'bg-brand-600/30 agent-active' : ''}
          ${status === 'complete' ? 'bg-emerald-900/40' : ''}
          ${status === 'idle'     ? 'bg-white/[0.04]' : ''}
        `}>
          {status === 'running'  && <span className="animate-spin text-sm">⚙️</span>}
          {status !== 'running'  && <span>{meta.icon}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{meta.label}</div>
          <div className="text-xs text-zinc-500">{meta.desc}</div>
        </div>
        <StatusDot status={status} />
      </div>

      {/* Message */}
      <AnimatePresence>
        {state?.message && (
          <motion.p
            key={state.message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-zinc-400 leading-relaxed"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Progress bar for running */}
      {status === 'running' && (
        <div className="mt-3 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Recent logs */}
      {status === 'running' && state?.logs?.length > 0 && (
        <div className="mt-2 font-mono text-[10px] text-zinc-600 space-y-0.5 max-h-16 overflow-hidden">
          {state.logs.slice(-3).map((log, i) => (
            <div key={i} className="truncate">› {log}</div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatusDot({ status }) {
  const cls = {
    idle:     'bg-zinc-700',
    running:  'bg-brand-500 animate-pulse',
    complete: 'bg-emerald-500',
    error:    'bg-red-500',
  }[status];
  return <div className={`w-2 h-2 rounded-full ${cls}`} />;
}
