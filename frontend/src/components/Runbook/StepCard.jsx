import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_STYLES = {
  COMMAND:  'step-command',
  ASSERT:   'step-assert',
  DECISION: 'step-decision',
  WAIT:     'step-wait',
};

const TYPE_ICONS = {
  COMMAND:  '$',
  ASSERT:   '✓',
  DECISION: '⟐',
  WAIT:     '⏸',
};

export default function StepCard({ step, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card-sm border border-white/[0.06] hover:border-white/10 transition-colors"
    >
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Order number */}
        <div className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center
                        text-[10px] text-zinc-500 font-mono shrink-0 mt-0.5">
          {step.order}
        </div>

        {/* Type badge */}
        <span className={`badge ${TYPE_STYLES[step.type] || 'badge-draft'} shrink-0 mt-0.5 font-mono`}>
          {TYPE_ICONS[step.type]} {step.type}
        </span>

        {/* Description */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white">{step.description}</div>
          {step.cmd && !expanded && (
            <div className="text-xs text-zinc-500 font-mono truncate mt-0.5">{step.cmd}</div>
          )}
        </div>

        {/* Approval indicator */}
        {step.requires_approval && (
          <span className="badge badge-warning text-[10px] shrink-0">approval</span>
        )}

        {/* Expand chevron */}
        <span className={`text-zinc-600 text-xs transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`}>›</span>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-white/[0.04] pt-2">
              {step.cmd && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Command</div>
                  <div className="terminal text-xs">{step.cmd}</div>
                </div>
              )}
              {step.params?.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Parameters</div>
                  <div className="flex flex-wrap gap-1">
                    {step.params.map(p => (
                      <span key={p} className="font-mono text-[10px] px-1.5 py-0.5 bg-amber-900/30
                                               text-amber-300 rounded border border-amber-700/30">
                        {`{${p}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {step.estimated_duration_seconds && (
                <div className="text-[10px] text-zinc-600">
                  Est. duration: {step.estimated_duration_seconds}s
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
