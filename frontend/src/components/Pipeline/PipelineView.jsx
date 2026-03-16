import { motion } from 'framer-motion';
import { useTarsStore } from '../../store/useTarsStore';
import AgentCard from './AgentCard';

const AGENTS = ['ingestion', 'step_extractor', 'dependency_analyzer', 'param_mapper'];

export default function PipelineView({ onComplete }) {
  const agentStates       = useTarsStore(s => s.agentStates);
  const synthesisComplete = useTarsStore(s => s.synthesisComplete);
  const synthesizedRunbook = useTarsStore(s => s.synthesizedRunbook);

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
          AI Synthesis Pipeline
        </span>
        {synthesisComplete && (
          <span className="badge badge-approved fade-in">Complete</span>
        )}
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <AgentCard agentKey={key} state={agentStates[key]} />
          </motion.div>
        ))}
      </div>

      {/* Completion card */}
      {synthesisComplete && synthesizedRunbook && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Runbook synthesized
              </div>
              <div className="text-xs text-emerald-600 mt-0.5">
                {synthesizedRunbook.totalSteps} steps · Status: DRAFT
              </div>
            </div>
            <button
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white
                         px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              onClick={() => onComplete?.(synthesizedRunbook)}
            >
              View Runbook
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
