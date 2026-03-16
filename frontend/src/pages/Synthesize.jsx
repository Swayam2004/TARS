import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WorkspaceHeader from '../components/WorkspaceHeader';
import PipelineView from '../components/Pipeline/PipelineView';
import RunbookViewer from '../components/Runbook/RunbookViewer';
import FloatingAIButton from '../components/Runbook/FloatingAIButton';
import { useSSEPipeline } from '../components/Pipeline/useSSEPipeline';
import { useTarsStore } from '../store/useTarsStore';
import { getRunbook } from '../api/client';

export default function Synthesize() {
  const { docId }      = useParams();
  const navigate       = useNavigate();
  const [runbook, setRunbook] = useState(null);
  const synthesisComplete     = useTarsStore(s => s.synthesisComplete);
  const currentRunbookId      = useTarsStore(s => s.currentRunbookId);

  useSSEPipeline(docId, {
    onComplete: async (data) => {
      const { data: rb } = await getRunbook(data.runbookId);
      setRunbook(rb);
    },
  });

  useEffect(() => {
    if (currentRunbookId && !runbook) {
      getRunbook(currentRunbookId).then(({ data }) => setRunbook(data));
    }
  }, [currentRunbookId]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display">
      <WorkspaceHeader title="AI Synthesis Pipeline" version="Processing" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <button
          className="flex items-center gap-1 text-slate-500 hover:text-primary text-sm mb-6 transition-colors"
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2">
            <PipelineView
              onComplete={(data) => {
                if (data.runbookId) navigate(`/runbooks/${data.runbookId}`);
              }}
            />
          </div>

          <div className="col-span-3">
            {runbook ? (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                <RunbookViewer
                  runbook={runbook}
                  onValidate={() => navigate(`/validate/${runbook.id}`)}
                  onExecute={() => navigate(`/execute/${runbook.id}`)}
                />
              </motion.div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
                <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
                {synthesisComplete ? 'Loading runbook…' : 'Runbook will appear here once synthesis completes…'}
              </div>
            )}
          </div>
        </div>
      </main>

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
