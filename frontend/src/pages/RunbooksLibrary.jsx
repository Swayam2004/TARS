import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../components/AppLayout';
import RunbookTable from '../components/Dashboard/RunbookTable';
import { getRunbooks } from '../api/client';

export default function RunbooksLibrary() {
  const [runbooks, setRunbooks] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRunbooks()
      .then(({ data }) => setRunbooks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Runbook Library</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {runbooks.length} runbook{runbooks.length !== 1 ? 's' : ''} across all sources
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white
                       px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Runbook
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400 text-sm">
              <span className="material-symbols-outlined animate-spin">sync</span>
              Loading runbooks…
            </div>
          ) : (
            <RunbookTable runbooks={runbooks} />
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
