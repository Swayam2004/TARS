import StepCard from './StepCard';
import { useTarsStore } from '../../store/useTarsStore';

const STATUS_BADGE = {
  DRAFT:      'badge-draft',
  VALIDATED:  'badge-validated',
  APPROVED:   'badge-approved',
  DEPRECATED: 'badge-failed',
};

export default function RunbookViewer({ runbook, onValidate, onExecute }) {
  const executionState = useTarsStore(s => s.executionState);

  if (!runbook) return null;

  const steps  = runbook.steps  || [];
  const params = runbook.params || [];

  const commandCount  = steps.filter(s => s.type === 'COMMAND').length;
  const assertCount   = steps.filter(s => s.type === 'ASSERT').length;
  const approvalCount = steps.filter(s => s.requires_approval).length;

  function getExecStatus(stepId) {
    if (!executionState) return 'pending';
    const found = executionState.steps?.find(s => s.stepId === stepId);
    if (!found) return executionState.currentStepId === stepId ? 'running' : 'pending';
    return found.status;
  }

  function getOutput(stepId) {
    if (!executionState) return null;
    return executionState.steps?.find(s => s.stepId === stepId)?.output || null;
  }

  return (
    <div>
      {/* Runbook meta header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card p-5 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-slate-900">{runbook.name}</h1>
              <span className={`badge ${STATUS_BADGE[runbook.status] || 'badge-draft'}`}>
                {runbook.status}
              </span>
              <span className="text-xs text-slate-400 border border-slate-200 rounded px-2 py-0.5">
                v{runbook.version}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{steps.length} steps</span>
              <span>·</span>
              <span>{commandCount} commands</span>
              <span>·</span>
              <span>{assertCount} assertions</span>
              {approvalCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-amber-600 font-medium">
                    {approvalCount} approval gate{approvalCount > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {['DRAFT', 'VALIDATED'].includes(runbook.status) && onValidate && (
              <button
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg
                           transition-colors text-sm font-medium border border-slate-200"
                onClick={onValidate}
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Validate
              </button>
            )}
            {['VALIDATED', 'APPROVED'].includes(runbook.status) && onExecute && (
              <button
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white
                           px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                onClick={onExecute}
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Dry Run
              </button>
            )}
          </div>
        </div>

        {params.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Input Parameters</div>
            <div className="flex flex-wrap gap-2">
              {params.map(p => (
                <div key={p.name} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                  <span className="font-mono text-[10px] text-amber-600">{`{${p.name}}`}</span>
                  {p.required  && <span className="text-[9px] text-slate-400">required</span>}
                  {p.sensitive && <span className="text-[9px] text-red-500">secret</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            execStatus={getExecStatus(step.id)}
            output={getOutput(step.id)}
            language={step.type === 'COMMAND' ? 'SHELL' : 'YAML'}
          />
        ))}
      </div>

      {/* Add step */}
      <div className="flex items-center justify-center py-8">
        <button className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-slate-300
                           rounded-xl text-slate-500 hover:border-primary hover:text-primary transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          <span className="font-semibold">Add new step</span>
        </button>
      </div>
    </div>
  );
}
