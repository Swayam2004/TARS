import { motion } from 'framer-motion';
import DropZone from '../components/Upload/DropZone';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="px-8 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/20
                          border border-brand-500/30 text-brand-400 text-xs mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            GenW Platform · AI Agent Pipeline
          </div>
          <h1 className="text-3xl font-semibold text-white mb-3 leading-tight">
            Transform procedures<br />into executable runbooks
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-lg">
            Upload any operational document — PDF, DOCX, or Markdown.
            TARS extracts steps, builds dependency graphs, validates against
            policy, and generates an auditable runbook in minutes.
          </p>
        </motion.div>
      </div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex-1 px-8 pb-8"
      >
        <DropZone />
      </motion.div>

      {/* Pipeline explainer strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-8 pb-10"
      >
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            {[
              { icon: '📥', label: 'Ingest' },
              { icon: '→',  label: ''        },
              { icon: '🔍', label: 'Extract' },
              { icon: '→',  label: ''        },
              { icon: '⚙',  label: 'Validate'},
              { icon: '→',  label: ''        },
              { icon: '▶',  label: 'Execute' },
            ].map((item, i) => (
              item.label === ''
                ? <div key={i} className="text-zinc-700 text-xs">→</div>
                : (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06]
                                    flex items-center justify-center text-base">
                      {item.icon}
                    </div>
                    <span className="text-[10px] text-zinc-600">{item.label}</span>
                  </div>
                )
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
