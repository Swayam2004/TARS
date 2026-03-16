import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATUS_BADGE = {
  DRAFT:      'badge-draft',
  VALIDATED:  'badge-validated',
  APPROVED:   'badge-approved',
  DEPRECATED: 'badge-failed',
};

export default function RunbookTable({ runbooks = [] }) {
  const navigate = useNavigate();

  if (!runbooks.length) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-slate-300">menu_book</span>
        No runbooks yet — upload a document to get started.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {['Name', 'Status', 'Source', 'Runs', 'Created', ''].map(h => (
              <th key={h} className="text-left pb-3 px-3 text-[10px] uppercase tracking-widest
                                     text-slate-400 font-medium first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {runbooks.map((rb, i) => (
            <motion.tr
              key={rb.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/runbooks/${rb.id}`)}
            >
              <td className="py-3 pl-0 px-3">
                <div className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                  {rb.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{rb.id}</div>
              </td>
              <td className="py-3 px-3">
                <span className={`badge ${STATUS_BADGE[rb.status] || 'badge-draft'}`}>
                  {rb.status}
                </span>
              </td>
              <td className="py-3 px-3 text-xs text-slate-500 max-w-[160px] truncate">
                {rb.source_doc || '—'}
              </td>
              <td className="py-3 px-3 text-xs text-slate-500">{rb.run_count ?? 0}</td>
              <td className="py-3 px-3 text-xs text-slate-500">
                {rb.created_at ? new Date(rb.created_at).toLocaleDateString() : '—'}
              </td>
              <td className="py-3 px-3 text-right">
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary
                                 transition-colors text-[18px]">
                  chevron_right
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
