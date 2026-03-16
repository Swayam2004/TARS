import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid_view'   },
  { to: '/runbooks',  label: 'Library',   icon: 'menu_book'   },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-light font-display">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 py-3">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          <span className="text-slate-900 text-lg font-bold tracking-tight">TARS</span>
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-primary/10 text-primary'
                   : 'text-slate-600 hover:text-primary hover:bg-primary/5'}`
              }
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Runbook
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-primary text-sm">person</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-2 text-primary/70">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
            <span className="text-slate-700 font-bold">TARS</span>
          </div>
          <p>© 2026 TARS · Deloitte Hacksplosion</p>
        </div>
      </footer>
    </div>
  );
}
