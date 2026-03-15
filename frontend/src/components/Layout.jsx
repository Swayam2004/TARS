import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/',          icon: '⚡', label: 'New Runbook'  },
  { to: '/dashboard', icon: '◈',  label: 'Dashboard'    },
  { to: '/runbooks',  icon: '≡',  label: 'Library'      },
];

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#0d0d12] border-r border-white/[0.06] flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">T</div>
            <div>
              <div className="text-sm font-semibold text-white">TARS</div>
              <div className="text-[10px] text-zinc-500 leading-none">Runbook Synthesis</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="text-[10px] text-zinc-600 leading-relaxed">
            <div className="font-medium text-zinc-500 mb-0.5">Built on</div>
            <div>GenW Platform</div>
            <div>Deloitte Hacksplosion 2026</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
