import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkspaceHeader from '../components/WorkspaceHeader';
import RunbookViewer from '../components/Runbook/RunbookViewer';
import FloatingAIButton from '../components/Runbook/FloatingAIButton';
import { getRunbook } from '../api/client';

export default function RunbookDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [runbook, setRunbook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRunbook(id)
      .then(({ data }) => setRunbook(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display">
      <WorkspaceHeader
        title={runbook?.name || 'Runbook'}
        version={runbook ? `${runbook.status} v${runbook.version}` : 'Loading…'}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <button
          className="flex items-center gap-1 text-slate-500 hover:text-primary text-sm mb-6 transition-colors"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 text-sm py-16 justify-center">
            <span className="material-symbols-outlined animate-spin">sync</span>
            Loading runbook…
          </div>
        ) : !runbook ? (
          <div className="text-red-500 text-sm text-center py-16">Runbook not found.</div>
        ) : (
          <RunbookViewer
            runbook={runbook}
            onValidate={() => navigate(`/validate/${runbook.id}`)}
            onExecute={() => navigate(`/execute/${runbook.id}`)}
          />
        )}
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
