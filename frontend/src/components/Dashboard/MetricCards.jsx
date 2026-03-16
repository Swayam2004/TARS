import { motion } from 'framer-motion';

const METRICS = [
  { key: 'totalRunbooks',      label: 'Total Runbooks',     icon: 'menu_book',    color: 'text-primary',       bg: 'bg-primary/10'       },
  { key: 'totalExecutions',    label: 'Executions',         icon: 'play_circle',  color: 'text-blue-600',      bg: 'bg-blue-100'         },
  { key: 'successRate',        label: 'Success Rate',       icon: 'check_circle', color: 'text-emerald-600',   bg: 'bg-emerald-100',  suffix: '%' },
  { key: 'violationsResolved', label: 'Violations Resolved',icon: 'verified',     color: 'text-amber-600',     bg: 'bg-amber-100'        },
];

export default function MetricCards({ kpis = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {METRICS.map(({ key, label, icon, color, bg, suffix = '' }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
            </div>
          </div>
          <div className={`text-3xl font-black ${color}`}>
            {kpis[key] != null ? `${kpis[key]}${suffix}` : '—'}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
