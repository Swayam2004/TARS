import { Link } from 'react-router-dom';

export default function WorkspaceHeader({ title = 'Interactive Runbook', version = 'Draft v1.2', onHistory, onShare }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 py-3">
      {/* Left: logo + title + version badge */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-primary">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </Link>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        <div className="ml-2 px-2 py-0.5 rounded border border-slate-200 text-xs font-medium text-slate-500">
          {version}
        </div>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onHistory}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-xl">history</span>
          <span className="text-sm font-medium hidden sm:inline">History</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">share</span>
          <span>Share</span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 shrink-0">
          <span className="material-symbols-outlined text-primary text-sm">person</span>
        </div>
      </div>
    </header>
  );
}
