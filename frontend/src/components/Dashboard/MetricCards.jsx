import { motion } from 'framer-motion';

const METRICS = [
  { key: 'totalRunbooks',     label: 'Total Runbooks',    icon: '≡',  color: 'text-brand-400'   },
  { key: 'totalExecutions',   label: 'Executions',        icon: '▶',  color: 'text-blue-400'    },
  { key: 'successRate',       label: 'Success Rate',      icon: '✓',  color: 'text-emerald-400', suffix: '%' },
  { key: 'violationsResolved',label: 'Violations Resolved',icon: '⚠', color: 'text-amber-400'   },
];

export default function MetricCards({ kpis = {} }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {METRICS.map(({ key, label, icon, color, suffix = '' }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className={`text-base ${color}`}>{icon}</span>
          </div>
          <div className={`text-2xl font-semibold ${color}`}>
            {kpis[key] != null ? `${kpis[key]}${suffix}` : '—'}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
