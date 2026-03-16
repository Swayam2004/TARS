import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EXAMPLES = [
  'Kubernetes pod stuck in CrashLoopBackOff',
  'PostgreSQL failover procedure',
  'Restore AWS RDS from snapshot',
  'SSL certificate renewal — Nginx',
];

export default function HeroSection() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  function handleGenerate() {
    if (prompt.trim()) navigate('/dashboard');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleGenerate();
  }

  return (
    <section className="relative px-6 py-20 md:py-32 lg:px-40 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="hero-gradient absolute inset-0" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm">bolt</span>
          Next-Gen Operations
        </div>

        {/* Headline */}
        <h1 className="text-slate-900 text-5xl md:text-7xl font-black leading-tight tracking-tight">
          Your Intelligent{' '}
          <span className="text-primary">Runbook</span>{' '}
          Assistant
        </h1>

        {/* Subtext */}
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl leading-relaxed">
          Automate your operational workflows with AI-driven precision.
          Transform complex incidents into actionable steps in seconds.
        </p>

        {/* Prompt input */}
        <div className="w-full max-w-3xl mt-4">
          <div className="group relative flex items-center p-2 rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 focus-within:border-primary transition-all">
            {/* Terminal icon */}
            <div className="flex items-center justify-center pl-4 text-slate-400">
              <span className="material-symbols-outlined">terminal</span>
            </div>

            {/* Input */}
            <input
              className="w-full bg-transparent border-none outline-none focus:ring-0 text-slate-900 px-4 py-4 text-base md:text-lg placeholder:text-slate-400"
              placeholder="Describe the incident or procedure (e.g., 'Restore AWS RDS from snapshot')..."
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Actions */}
            <div className="flex items-center gap-2 pr-2">
              <button
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Attach File"
                onClick={() => navigate('/')}
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button
                onClick={handleGenerate}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-primary/20"
              >
                <span>Generate</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-slate-400 text-sm">
            Try:{' '}
            {EXAMPLES.slice(0, 2).map((ex, i) => (
              <span key={ex}>
                <button
                  className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                  onClick={() => setPrompt(ex)}
                >
                  "{ex}"
                </button>
                {i === 0 && <span className="mx-1">or</span>}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
