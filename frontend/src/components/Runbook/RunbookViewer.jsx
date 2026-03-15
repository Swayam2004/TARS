import StepCard from './StepCard';

const STATUS_BADGE = {
  DRAFT:      'badge-draft',
  VALIDATED:  'badge-validated',
  APPROVED:   'badge-approved',
  DEPRECATED: 'badge-failed',
};

export default function RunbookViewer({ runbook, onValidate, onExecute }) {
  if (!runbook) return null;

  const steps  = runbook.steps  || [];
  const params = runbook.params || [];

  const commandCount  = steps.filter(s => s.type === 'COMMAND').length;
  const assertCount   = steps.filter(s => s.type === 'ASSERT').length;
  const approvalCount = steps.filter(s => s.requires_approval).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-white">{runbook.name}</h2>
              <span className={`badge ${STATUS_BADGE[runbook.status] || 'badge-draft'}`}>
                {runbook.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>{steps.length} steps</span>
              <span>{commandCount} commands</span>
              <span>{assertCount} assertions</span>
              {approvalCount > 0 && (
                <span className="text-amber-400">{approvalCount} approval gate{approvalCount > 1 ? 's' : ''}</span>
              )}
              <span>v{runbook.version}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            {['DRAFT', 'VALIDATED'].includes(runbook.status) && onValidate && (
              <button className="btn-secondary text-xs" onClick={onValidate}>
                ⚙ Validate
              </button>
            )}
            {['VALIDATED', 'APPROVED'].includes(runbook.status) && onExecute && (
              <button className="btn-primary text-xs" onClick={onExecute}>
                ▶ Dry Run
              </button>
            )}
          </div>
        </div>

        {/* Parameters */}
        {params.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Input Parameters</div>
            <div className="flex flex-wrap gap-1.5">
              {params.map(p => (
                <div key={p.name}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                  <span className="font-mono text-[10px] text-amber-300">{`{${p.name}}`}</span>
                  {p.required && <span className="text-[9px] text-zinc-600">required</span>}
                  {p.sensitive && <span className="text-[9px] text-red-500">secret</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}
