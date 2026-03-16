import { motion } from 'framer-motion';

export default function ApprovalModal({ step, onApprove, onReject }) {
  if (!step) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        className="bg-white border border-amber-200 rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        {/* Icon + title */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-amber-600 text-2xl">gavel</span>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">Human Approval Required</div>
            <div className="text-xs text-slate-500 mt-0.5">Step {step.order} · {step.type || 'COMMAND'}</div>
          </div>
        </div>

        {/* Step detail */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <div className="text-sm font-medium text-slate-800 mb-2">{step.description}</div>
          {step.cmd && (
            <div className="font-mono text-xs text-slate-600 bg-white border border-slate-200
                            rounded-lg p-3 leading-relaxed overflow-x-auto">
              {step.cmd}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mb-5">
          This step performs a high-risk operation and requires explicit approval before execution proceeds.
          Review the command above carefully before confirming.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2
                       bg-primary hover:bg-primary/90 text-white
                       px-4 py-2.5 rounded-lg text-sm font-bold
                       transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Approve &amp; Continue
          </button>
          <button
            onClick={onReject}
            className="flex items-center justify-center gap-2
                       bg-red-50 hover:bg-red-100 text-red-600
                       border border-red-200 px-4 py-2.5 rounded-lg
                       text-sm font-semibold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
}
