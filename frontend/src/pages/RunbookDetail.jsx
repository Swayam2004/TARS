import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RunbookViewer from '../components/Runbook/RunbookViewer';
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

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-zinc-600 text-sm">
        <span className="animate-spin">⚙️</span> Loading runbook…
      </div>
    );
  }

  if (!runbook) {
    return (
      <div className="p-8 text-red-400 text-sm">Runbook not found.</div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button className="text-zinc-600 hover:text-zinc-400 text-xs mb-4 transition-colors"
        onClick={() => navigate(-1)}>
        ← Back
      </button>
      <RunbookViewer
        runbook={runbook}
        onValidate={() => navigate(`/validate/${runbook.id}`)}
        onExecute={() => navigate(`/execute/${runbook.id}`)}
      />
    </div>
  );
}
