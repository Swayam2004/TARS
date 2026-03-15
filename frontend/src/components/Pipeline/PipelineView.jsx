import { motion } from 'framer-motion';
import { useTarsStore } from '../../store/useTarsStore';
import AgentCard from './AgentCard';

const AGENTS = ['ingestion', 'step_extractor', 'dependency_analyzer', 'param_mapper'];

export default function PipelineView({ onComplete }) {
  const agentStates      = useTarsStore(s => s.agentStates);
  const synthesisComplete = useTarsStore(s => s.synthesisComplete);
  const synthesizedRunbook = useTarsStore(s => s.synthesizedRunbook);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="text-xs uppercase tracking-widest text-zinc-500 font-medium">AI Synthesis Pipeline</div>
        {synthesisComplete && (
          <span className="badge badge-approved fade-in">Complete</span>
        )}
      </div>

      {/* Agent cards with connecting arrows */}
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <AgentCard agentKey={key} state={agentStates[key]} />
          </motion.div>
        ))}
      </div>

      {/* Completion summary */}
      {synthesisComplete && synthesizedRunbook && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 card-sm p-4 border border-emerald-500/30 bg-emerald-900/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-emerald-400">
                ✓ Runbook synthesized
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {synthesizedRunbook.totalSteps} steps · Status: DRAFT
              </div>
            </div>
            <button
              className="btn-primary text-xs"
              onClick={() => onComplete?.(synthesizedRunbook)}
            >
              View Runbook →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
