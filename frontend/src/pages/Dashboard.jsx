import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const [data,     setData]     = useState(null);
  const [runbooks, setRunbooks] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getRunbooks()])
      .then(([{ data: dash }, { data: rbs }]) => {
        setData(dash);
        setRunbooks(rbs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-zinc-600 text-sm">
        <span className="animate-pulse">Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Knowledge base · Execution analytics</p>
        </div>
        <button className="btn-primary text-xs" onClick={() => navigate('/')}>
          + New Runbook
        </button>
      </div>

      {/* KPI cards */}
      <MetricCards kpis={data?.kpis || {}} />

      {/* Chart + recent runs */}
      <div className="grid grid-cols-5 gap-4">
        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="col-span-3 card p-4"
        >
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            Execution Trend — Last 7 Days
          </div>
          <ExecutionChart trend={data?.trend || []} />
        </motion.div>

        {/* Recent runs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-2 card p-4"
        >
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            Recent Executions
          </div>
          <div className="space-y-1.5">
            {(data?.recentRuns || []).slice(0, 7).map(run => (
              <div key={run.id} className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                <span className={`badge text-[10px] ${STATUS_BADGE[run.status] || 'badge-draft'}`}>
                  {run.status}
                </span>
                <span className="text-xs text-zinc-400 truncate flex-1">{run.runbook_name}</span>
                <span className="text-[10px] text-zinc-600 shrink-0">
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="card p-4"
        >
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Runbook Status Breakdown</div>
          <div className="flex gap-4">
            {data.statusBreakdown.map(({ status, count }) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`badge ${STATUS_BADGE[status] || 'badge-draft'}`}>{status}</span>
                <span className="text-sm font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Runbook library table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Runbook Library</div>
          <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            onClick={() => navigate('/runbooks')}>
            View all →
          </button>
        </div>
        <RunbookTable runbooks={runbooks.slice(0, 5)} />
      </motion.div>

      {/* Top runbooks from knowledge base */}
      {data?.topRunbooks?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="card p-4"
        >
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            Knowledge Base — Top Runbooks
          </div>
          <div className="space-y-2">
            {data.topRunbooks.map(rb => {
              const total = rb.success_count + rb.failure_count;
              const rate  = total > 0 ? Math.round((rb.success_count / total) * 100) : 0;
              return (
                <div key={rb.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{rb.name}</div>
                    <div className="text-[10px] text-zinc-600">
                      {total} runs · {rb.avg_duration?.toFixed(1)}s avg
                    </div>
                  </div>
                  {/* Mini success bar */}
                  <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-8 text-right">{rate}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
