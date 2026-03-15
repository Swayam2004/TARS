import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DryRunViewer from '../components/Execution/DryRunViewer';
import ApprovalModal from '../components/Execution/ApprovalModal';
import { getRunbook } from '../api/client';
import { useTarsStore } from '../store/useTarsStore';

export default function Execute() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const esRef     = useRef(null);

  const [runbook,         setRunbook]         = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [started,         setStarted]         = useState(false);

  const {
    initExecution, updateExecutionStep,
    completeExecution, executionState, executing,
  } = useTarsStore();

  useEffect(() => {
    getRunbook(id).then(({ data }) => setRunbook(data));
  }, [id]);

  function startExecution() {
    if (esRef.current) esRef.current.close();
    setStarted(true);
    setPendingApproval(null);

    const es = new EventSource(`/api/runbooks/${id}/execute`);
    esRef.current = es;

    es.addEventListener('run_start', e => {
      const d = JSON.parse(e.data);
      initExecution(d.runId, d.totalSteps);
    });

    es.addEventListener('step_start', e => {
      const d = JSON.parse(e.data);
      updateExecutionStep({ stepId: d.stepId, order: d.order, status: 'running',
                            type: d.type, description: d.description, cmd: d.cmd });
    });

    es.addEventListener('step_awaiting_approval', e => {
      const d = JSON.parse(e.data);
      // Show the approval modal — in dry-run we auto-approve server-side,
      // but showing the modal makes the demo experience real
      setPendingApproval({ ...d, order: d.stepId });
      updateExecutionStep({ stepId: d.stepId, status: 'awaiting' });
      setTimeout(() => setPendingApproval(null), 2200); // auto-dismiss after 2.2s
    });

    es.addEventListener('step_approved', e => {
      const d = JSON.parse(e.data);
      updateExecutionStep({ stepId: d.stepId, status: 'running' });
    });

    es.addEventListener('step_complete', e => {
      const d = JSON.parse(e.data);
      updateExecutionStep({ stepId: d.stepId, status: d.status, output: d.output });
    });

    es.addEventListener('run_complete', e => {
      const d = JSON.parse(e.data);
      completeExecution(d);
      es.close();
    });

    es.addEventListener('error', e => {
      try { console.error('[SSE Execute]', JSON.parse(e.data)); } catch {}
      es.close();
    });

    es.onerror = () => es.close();
  }

  useEffect(() => () => esRef.current?.close(), []);

  const steps = runbook?.steps || [];
  const isDone = executionState && !executing;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button className="text-zinc-600 hover:text-zinc-400 text-xs mb-4 transition-colors"
        onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Dry Run Execution</h1>
          {runbook && <p className="text-zinc-500 text-sm mt-1">{runbook.name}</p>}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-zinc-600 border border-white/[0.06] rounded px-2 py-1">
            MODE: DRY-RUN
          </span>
          {!started && (
            <button className="btn-primary text-xs" onClick={startExecution} disabled={!runbook}>
              ▶ Start Dry Run
            </button>
          )}
          {isDone && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="btn-secondary text-xs"
              onClick={startExecution}
            >
              ↺ Run Again
            </motion.button>
          )}
        </div>
      </div>

      {/* Pre-run info */}
      {!started && runbook && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-4 mb-4 border border-white/[0.06]"
        >
          <div className="text-sm text-zinc-400 mb-3">
            Ready to execute <span className="text-white font-medium">{steps.length} steps</span>.
            All high-risk steps will trigger an approval gate.
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Total steps',    val: steps.length },
              { label: 'Need approval',  val: steps.filter(s => s.requires_approval).length },
              { label: 'COMMAND steps',  val: steps.filter(s => s.type === 'COMMAND').length },
            ].map(({ label, val }) => (
              <div key={label} className="card-sm py-2 px-3">
                <div className="text-lg font-semibold text-white">{val}</div>
                <div className="text-[10px] text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dry run viewer */}
      {started && <DryRunViewer allSteps={steps} />}

      {/* Approval modal */}
      {pendingApproval && (
        <ApprovalModal
          step={{
            order: pendingApproval.stepId,
            description: pendingApproval.description || 'High-risk operation',
            cmd: pendingApproval.cmd,
          }}
          onApprove={() => setPendingApproval(null)}
          onReject={() => setPendingApproval(null)}
        />
      )}
    </div>
  );
}
