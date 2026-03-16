const FEATURES = [
  {
    icon:  'auto_fix_high',
    title: 'Auto-Generation',
    desc:  'Convert natural language prompts into structured, actionable runbooks instantly using LLM architecture.',
  },
  {
    icon:  'upload_file',
    title: 'Context Aware',
    desc:  'Upload your existing technical documentation and PDF guides to train your custom workspace brain.',
  },
  {
    icon:  'integration_instructions',
    title: 'Smart Execution',
    desc:  'Directly execute steps via integrated CLI, API tools, and Terraform hooks for seamless infrastructure management.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="px-6 py-20 md:px-20 lg:px-40 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-slate-900 text-3xl md:text-4xl font-bold mb-4">
              Streamline Your Operations
            </h2>
            <p className="text-slate-600 text-lg">
              Built for modern engineering teams to manage incidents and standard procedures
              with unmatched speed.
            </p>
          </div>
          <a href="#" className="text-primary font-bold flex items-center gap-1 hover:underline whitespace-nowrap">
            View all features
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group p-8 rounded-2xl border border-slate-100 bg-background-light hover:border-primary/30 hover:shadow-card-hover transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
              </div>
              <h3 className="text-slate-900 text-xl font-bold mb-3">{title}</h3>
              <p className="text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
