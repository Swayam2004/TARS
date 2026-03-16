export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-12 md:px-20 lg:px-40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 text-primary opacity-80">
          <span className="material-symbols-outlined text-2xl font-bold">auto_awesome</span>
          <span className="text-slate-900 font-bold">TARS</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Status'].map(link => (
            <a key={link} href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">
              {link}
            </a>
          ))}
        </div>
        <p className="text-slate-400 text-sm">© 2026 TARS Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
