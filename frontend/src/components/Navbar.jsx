import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 md:px-20 lg:px-40 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-3xl font-bold">auto_awesome</span>
        <h2 className="text-slate-900 text-xl font-bold tracking-tight">TARS</h2>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex flex-1 justify-end gap-10 items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-slate-600 hover:text-primary text-sm font-medium transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="text-slate-600 hover:text-primary text-sm font-medium transition-colors">
            Dashboard
          </Link>
          <Link to="/runbooks" className="text-slate-600 hover:text-primary text-sm font-medium transition-colors">
            Library
          </Link>
        </div>
        <button
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
          onClick={() => navigate('/dashboard')}
        >
          Open App
        </button>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-slate-900"
        onClick={() => setMobileOpen(v => !v)}
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 md:hidden shadow-lg">
          <Link to="/"          className="text-slate-700 font-medium" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/dashboard" className="text-slate-700 font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <Link to="/runbooks"  className="text-slate-700 font-medium" onClick={() => setMobileOpen(false)}>Library</Link>
          <button
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold w-full"
            onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
          >
            Open App
          </button>
        </div>
      )}
    </header>
  );
}
