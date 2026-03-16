import { useNavigate } from 'react-router-dom';

const BULLETS = [
  {
    title: 'Version Control Built-in',
    desc:  'Track every change and roll back to previous versions of your procedures with ease.',
  },
  {
    title: 'Team Collaboration',
    desc:  'Collaborate in real-time during live incidents with shared state and audit logs.',
  },
  {
    title: 'Multi-Cloud Support',
    desc:  'Native integrations for AWS, Azure, GCP, and on-premise infrastructure setups.',
  },
];

export default function PreviewSection() {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-20 md:px-20 lg:px-40 bg-background-light overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">

        {/* Left: text content */}
        <div className="flex-1 space-y-8">
          <h2 className="text-slate-900 text-4xl font-bold leading-tight">
            Interactive Runbook Interface
          </h2>

          <div className="space-y-6">
            {BULLETS.map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <span className="material-symbols-outlined text-primary font-bold shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">{title}</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:bg-slate-800 active:scale-95"
          >
            Explore Dashboard
          </button>
        </div>

        {/* Right: mock dashboard image */}
        <div className="flex-1 relative">
          {/* Decorative rotated card behind the image */}
          <div className="absolute -top-10 -right-10 w-full h-full bg-primary/10 rounded-2xl -z-10 rotate-3" />

          {/* Dashboard preview built from live data indicators */}
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 p-5">
            {/* Mock header bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-3 h-5 bg-slate-700 rounded text-[10px] font-mono text-slate-400 flex items-center px-2">
                tars.deloitte.app/dashboard
              </div>
            </div>

            {/* Mock KPI row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Runbooks', val: '4',   color: 'text-blue-400' },
                { label: 'Executions', val: '10', color: 'text-emerald-400' },
                { label: 'Success',   val: '80%', color: 'text-emerald-400' },
                { label: 'Policies',  val: '10',  color: 'text-amber-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className={`text-lg font-bold ${color}`}>{val}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Mock chart bars */}
            <div className="bg-slate-800 rounded-lg p-3 mb-3">
              <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Execution Trend</div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                    <div className="bg-emerald-500/70 rounded-sm" style={{ height: `${h * 0.5}px` }} />
                    <div className="bg-red-500/40 rounded-sm" style={{ height: `${(100 - h) * 0.12}px` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mock runbook rows */}
            <div className="space-y-1.5">
              {[
                { name: 'DB Failover — PostgreSQL', status: 'APPROVED', color: 'text-emerald-400' },
                { name: 'K8s Pod Restart',          status: 'APPROVED', color: 'text-emerald-400' },
                { name: 'SSL Certificate Renewal',  status: 'VALIDATED', color: 'text-blue-400' },
              ].map(({ name, status, color }) => (
                <div key={name} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-[11px] text-slate-300 truncate">{name}</span>
                  <span className={`text-[10px] font-bold ${color} ml-2 shrink-0`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
