import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WorkspaceHeader from '../components/WorkspaceHeader';
import DryRunViewer from '../components/Execution/DryRunViewer';
import ApprovalModal from '../components/Execution/ApprovalModal';
import FloatingAIButton from '../components/Runbook/FloatingAIButton';
import { getRunbook } from '../api/client';
import { useTarsStore } from '../store/useTarsStore';

export default function Execute() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const esRef     = useRef(null);

  const [runbook,         setRunbook]         = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [started,         setStarted]         = useState(false);

  const { initExecution, updateExecutionStep, completeExecution, executionState, executing } = useTarsStore();

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
      setPendingApproval({ ...d, order: d.stepId });
      updateExecutionStep({ stepId: d.stepId, status: 'awaiting' });
      setTimeout(() => setPendingApproval(null), 2200);
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
      completeExecution(JSON.parse(e.data));
      es.close();
    });
    es.onerror = () => es.close();
  }

  useEffect(() => () => esRef.current?.close(), []);

  const steps  = runbook?.steps || [];
  const isDone = executionState && !executing;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display">
      <WorkspaceHeader
        title={runbook?.name || 'Dry Run Execution'}
        version="DRY-RUN MODE"
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        <button
          className="flex items-center gap-1 text-slate-500 hover:text-primary text-sm transition-colors"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dry Run Execution</h1>
            {runbook && <p className="text-slate-500 text-sm mt-1">{runbook.name}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 border border-slate-200 bg-white rounded px-2 py-1">
              MODE: DRY-RUN
            </span>
            {!started && (
              <button
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white
                           px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-40"
                onClick={startExecution}
                disabled={!runbook}
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Dry Run
              </button>
            )}
            {isDone && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100
                           border border-slate-200 rounded-lg text-sm font-medium transition-colors"
                onClick={startExecution}
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                Run Again
              </motion.button>
            )}
          </div>
        </div>

        {/* Pre-run info */}
        {!started && runbook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
          >
            <p className="text-sm text-slate-600 mb-4">
              Ready to execute{' '}
              <span className="font-bold text-slate-900">{steps.length} steps</span>.
              High-risk steps will trigger approval gates.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total steps',   val: steps.length },
                { label: 'Need approval', val: steps.filter(s => s.requires_approval).length },
                { label: 'Commands',      val: steps.filter(s => s.type === 'COMMAND').length },
              ].map(({ label, val }) => (
                <div key={label} className="bg-background-light rounded-lg p-3 text-center border border-slate-100">
                  <div className="text-2xl font-bold text-primary">{val}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {started && <DryRunViewer allSteps={steps} />}
      </main>

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

      <FloatingAIButton onClick={() => {}} />

      <footer className="max-w-5xl mx-auto w-full px-4 pb-8 pt-4 border-t border-slate-200
                         flex justify-between items-center text-slate-400 text-sm">
        <span>© 2026 TARS</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          GenW Platform connected
        </div>
      </footer>
    </div>
  );
}
