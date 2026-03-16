import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepChat from './StepChat';

/**
 * StepCard — one runbook step in the workspace view.
 *
 * Props:
 *   step         {object}  — { id, order, type, description, cmd, requires_approval, params }
 *   index        {number}  — zero-based position (for stagger animation delay)
 *   execStatus   {string}  — 'pending' | 'running' | 'SUCCESS' | 'WARNING' | 'FAILED' | 'awaiting'
 *   output       {string}  — terminal output text shown after execution
 *   lastRun      {string}  — human-readable e.g. "2 mins ago"
 *   onRun        {fn}      — called when user clicks Run
 *   onStop       {fn}      — called when user clicks Stop
 *   onAskAI      {fn}      — called with (stepId, message) from inline chat
 *   language     {string}  — code block language label, defaults to 'PYTHON'
 */
export default function StepCard({
  step,
  index = 0,
  execStatus = 'pending',
  output,
  lastRun,
  onRun,
  onStop,
  onAskAI,
  language = 'PYTHON',
}) {
  const [copied, setCopied] = useState(false);

  const isRunning  = execStatus === 'running';
  const isAwaiting = execStatus === 'awaiting';

  function copyCode() {
    navigator.clipboard.writeText(step.cmd || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // ── Status label (left side of footer) ─────────────────────────────────
  function StatusLabel() {
    if (isRunning) return (
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-2 italic uppercase font-bold tracking-tight">
        <span className="material-symbols-outlined text-xs text-primary animate-spin">sync</span>
        Running...
      </div>
    );
    if (isAwaiting) return (
      <div className="flex items-center gap-1.5 text-[10px] text-amber-500 px-2 italic uppercase font-bold tracking-tight animate-pulse">
        <span className="material-symbols-outlined text-xs">pause_circle</span>
        Awaiting approval
      </div>
    );
    if (execStatus === 'SUCCESS') return (
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-2 italic">
        <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
        Completed
      </div>
    );
    if (execStatus === 'WARNING') return (
      <div className="flex items-center gap-1.5 text-[10px] text-amber-500 px-2 italic uppercase font-bold tracking-tight">
        <span className="material-symbols-outlined text-xs">warning</span>
        Warnings
      </div>
    );
    if (execStatus === 'FAILED') return (
      <div className="flex items-center gap-1.5 text-[10px] text-red-500 px-2 italic uppercase font-bold tracking-tight">
        <span className="material-symbols-outlined text-xs">error</span>
        Failed
      </div>
    );
    if (lastRun) return (
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-2 italic">
        <span className="material-symbols-outlined text-xs">info</span>
        Last run: {lastRun}
      </div>
    );
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-2 italic uppercase font-bold tracking-tight">
        <span className="material-symbols-outlined text-xs text-red-400">error</span>
        Not executed
      </div>
    );
  }

  // ── Action button (right side of footer) ───────────────────────────────
  function ActionButton() {
    if (isRunning) return (
      <button
        onClick={() => onStop?.(step.id)}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white
                   px-4 py-1.5 rounded text-sm font-semibold transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
        Stop
      </button>
    );
    return (
      <button
        onClick={() => onRun?.(step.id)}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white
                   px-4 py-1.5 rounded text-sm font-semibold transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-base">play_arrow</span>
        Run
      </button>
    );
  }

  // Border accent based on execution state
  const borderClass = {
    running:  'border-primary/40',
    awaiting: 'border-amber-400/50',
    SUCCESS:  'border-emerald-300/50',
    WARNING:  'border-amber-300/50',
    FAILED:   'border-red-300/50',
    pending:  'border-slate-200',
  }[execStatus] || 'border-slate-200';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`group relative bg-white rounded-xl border ${borderClass}
                  shadow-card hover:shadow-card-hover p-6 transition-shadow duration-200`}
    >
      {/* ── Step header ── */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full
                           bg-primary/10 text-primary text-xs font-bold shrink-0">
            {step.order}
          </span>
          <h2 className="text-xl font-bold text-slate-900">{step.description}</h2>
          {step.requires_approval && (
            <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                             bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[10px]">gavel</span>
              approval required
            </span>
          )}
        </div>

        {/* Step type tag */}
        <span className={`badge text-[10px] font-mono
          ${step.type === 'COMMAND'  ? 'step-command'  : ''}
          ${step.type === 'ASSERT'   ? 'step-assert'   : ''}
          ${step.type === 'DECISION' ? 'step-decision' : ''}
          ${step.type === 'WAIT'     ? 'step-wait'     : ''}
        `}>
          {step.type}
        </span>
      </div>

      {/* ── Code block ── */}
      <div className="flex-1 flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-slate-50">

        {/* Code header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-100">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            {language}
          </span>
          <button
            onClick={copyCode}
            className="text-slate-400 hover:text-primary transition-colors"
            title="Copy code"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>

        {/* Code content */}
        <div className="p-4 font-mono text-sm leading-relaxed text-slate-800 whitespace-pre-wrap overflow-x-auto min-h-[60px]">
          {step.cmd || `# ${step.description}`}
        </div>

        {/* Execution output (animates in) */}
        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-200"
            >
              <div className="p-3 font-mono text-[11px] bg-slate-950 text-emerald-400
                              leading-relaxed max-h-24 overflow-auto">
                {output}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: status | AI chat | action */}
        <div className="flex items-center p-2 border-t border-slate-200 gap-2">
          <StatusLabel />
          <StepChat stepId={step.id} status={isRunning ? 'running' : 'idle'} onSend={onAskAI} />
          <ActionButton />
        </div>
      </div>
    </motion.section>
  );
}
