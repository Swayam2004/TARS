import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../components/AppLayout';
import MetricCards from '../components/Dashboard/MetricCards';
import ExecutionChart from '../components/Dashboard/ExecutionChart';
import RunbookTable from '../components/Dashboard/RunbookTable';
import { getDashboard, getRunbooks } from '../api/client';

const STATUS_BADGE = {
  SUCCESS: 'badge-success',
  FAILED:  'badge-failed',
  RUNNING: 'badge-running',
  PENDING: 'badge-draft',
  WARNING: 'badge-warning',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [runbooks,setRunbooks]= useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getRunbooks()])
      .then(([{ data: dash }, { data: rbs }]) => { setData(dash); setRunbooks(rbs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32 gap-3 text-slate-400 text-sm">
          <span className="material-symbols-outlined animate-spin">sync</span>
          Loading dashboard…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-6 md:px-10 py-8 space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Knowledge base · Execution analytics</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white
                       px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Runbook
          </button>
        </div>

        {/* KPI cards */}
        <MetricCards kpis={data?.kpis || {}} />

        {/* Chart + recent runs */}
        <div className="grid grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="col-span-3 bg-white border border-slate-200 rounded-xl shadow-card p-5"
          >
            <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">
              Execution Trend — Last 7 Days
            </div>
            <ExecutionChart trend={data?.trend || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="col-span-2 bg-white border border-slate-200 rounded-xl shadow-card p-5"
          >
            <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">
              Recent Executions
            </div>
            <div className="space-y-1.5">
              {(data?.recentRuns || []).slice(0, 7).map(run => (
                <div key={run.id} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                  <span className={`badge text-[10px] ${STATUS_BADGE[run.status] || 'badge-draft'}`}>
                    {run.status}
                  </span>
                  <span className="text-xs text-slate-600 truncate flex-1">{run.runbook_name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {run.started_at ? new Date(run.started_at).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Status breakdown */}
        {data?.statusBreakdown?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
          >
            <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">
              Runbook Status Breakdown
            </div>
            <div className="flex gap-4 flex-wrap">
              {data.statusBreakdown.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`badge ${STATUS_BADGE[status] || 'badge-draft'}`}>{status}</span>
                  <span className="text-sm font-bold text-slate-700">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Runbook table */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">Runbook Library</div>
            <button
              className="text-xs text-primary hover:underline font-medium"
              onClick={() => navigate('/runbooks')}
            >
              View all →
            </button>
          </div>
          <RunbookTable runbooks={runbooks.slice(0, 5)} />
        </motion.div>

        {/* Knowledge base top runbooks */}
        {data?.topRunbooks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
          >
            <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">
              Knowledge Base — Top Runbooks
            </div>
            <div className="space-y-3">
              {data.topRunbooks.map(rb => {
                const total = rb.success_count + rb.failure_count;
                const rate  = total > 0 ? Math.round((rb.success_count / total) * 100) : 0;
                return (
                  <div key={rb.name} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{rb.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {total} runs · {rb.avg_duration?.toFixed(1)}s avg
                      </div>
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 w-8 text-right">{rate}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
