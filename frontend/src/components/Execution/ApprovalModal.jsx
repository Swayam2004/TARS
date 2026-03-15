import { motion } from 'framer-motion';

export default function ApprovalModal({ step, onApprove, onReject }) {
  if (!step) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-md w-full p-6 border border-amber-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-900/40 flex items-center justify-center text-xl">⏸</div>
          <div>
            <div className="text-sm font-semibold text-white">Human Approval Required</div>
            <div className="text-xs text-zinc-500">Step {step.order} · {step.type}</div>
          </div>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-3 mb-4 border border-white/[0.06]">
          <div className="text-sm text-white mb-2">{step.description}</div>
          {step.cmd && (
            <div className="terminal text-[10px]">{step.cmd}</div>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          This step performs a high-risk operation and requires explicit approval
          before execution proceeds. Review the command above and confirm.
        </p>

        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={onApprove}>
            ✓ Approve &amp; Continue
          </button>
          <button className="btn-danger" onClick={onReject}>
            ✗ Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
}
