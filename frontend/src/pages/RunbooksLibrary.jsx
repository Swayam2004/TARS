import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RunbookTable from '../components/Dashboard/RunbookTable';
import { getRunbooks } from '../api/client';

export default function RunbooksLibrary() {
  const [runbooks, setRunbooks] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRunbooks()
      .then(({ data }) => setRunbooks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Runbook Library</h1>
          <p className="text-zinc-500 text-sm mt-1">{runbooks.length} runbooks across all sources</p>
        </div>
        <button className="btn-primary text-xs" onClick={() => navigate('/')}>
          + New Runbook
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card p-4"
      >
        {loading
          ? <div className="text-zinc-600 text-sm text-center py-8 animate-pulse">Loading…</div>
          : <RunbookTable runbooks={runbooks} />
        }
      </motion.div>
    </div>
  );
}
