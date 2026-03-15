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
      <div className="text-center py-12 text-zinc-600 text-sm">
        No runbooks yet — upload a document to get started.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Name', 'Status', 'Source', 'Runs', 'Created', ''].map(h => (
              <th key={h} className="text-left pb-2 px-3 text-[10px] uppercase tracking-widest
                                     text-zinc-600 font-medium first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {runbooks.map((rb, i) => (
            <motion.tr
              key={rb.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
              onClick={() => navigate(`/runbooks/${rb.id}`)}
            >
              <td className="py-2.5 pl-0 px-3">
                <div className="font-medium text-white group-hover:text-brand-400 transition-colors">
                  {rb.name}
                </div>
                <div className="text-[10px] text-zinc-600 font-mono">{rb.id}</div>
              </td>
              <td className="py-2.5 px-3">
                <span className={`badge ${STATUS_BADGE[rb.status] || 'badge-draft'}`}>
                  {rb.status}
                </span>
              </td>
              <td className="py-2.5 px-3 text-xs text-zinc-500 max-w-[160px] truncate">
                {rb.source_doc || '—'}
              </td>
              <td className="py-2.5 px-3 text-xs text-zinc-500">{rb.run_count ?? 0}</td>
              <td className="py-2.5 px-3 text-xs text-zinc-500">
                {rb.created_at ? new Date(rb.created_at).toLocaleDateString() : '—'}
              </td>
              <td className="py-2.5 px-3 text-right">
                <span className="text-zinc-600 group-hover:text-zinc-300 transition-colors text-xs">›</span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
