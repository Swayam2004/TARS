import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PipelineView from '../components/Pipeline/PipelineView';
import RunbookViewer from '../components/Runbook/RunbookViewer';
import { useSSEPipeline } from '../components/Pipeline/useSSEPipeline';
import { useTarsStore } from '../store/useTarsStore';
import { getRunbook } from '../api/client';

export default function Synthesize() {
  const { docId }      = useParams();
  const navigate       = useNavigate();
  const [runbook, setRunbook] = useState(null);
  const synthesisComplete     = useTarsStore(s => s.synthesisComplete);
  const currentRunbookId      = useTarsStore(s => s.currentRunbookId);

  // Start the SSE pipeline
  useSSEPipeline(docId, {
    onComplete: async (data) => {
      const { data: rb } = await getRunbook(data.runbookId);
      setRunbook(rb);
    },
  });

  // If runbook already in store from a prior load
  useEffect(() => {
    if (currentRunbookId && !runbook) {
      getRunbook(currentRunbookId).then(({ data }) => setRunbook(data));
    }
  }, [currentRunbookId]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <button className="text-zinc-600 hover:text-zinc-400 text-xs mb-3 transition-colors"
          onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-white">AI Synthesis Pipeline</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Multi-agent orchestration — extracting runbook from uploaded document
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: pipeline */}
        <div className="col-span-2">
          <PipelineView
            onComplete={(data) => {
              if (data.runbookId) navigate(`/runbooks/${data.runbookId}`);
            }}
          />
        </div>

        {/* Right: runbook output (appears progressively) */}
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
            <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
              {synthesisComplete ? 'Loading runbook…' : 'Runbook will appear here once synthesis completes…'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
