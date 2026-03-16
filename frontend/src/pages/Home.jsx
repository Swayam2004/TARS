import Navbar         from '../components/Navbar';
import HeroSection    from '../components/Landing/HeroSection';
import FeatureGrid    from '../components/Landing/FeatureGrid';
import PreviewSection from '../components/Landing/PreviewSection';
import LandingFooter  from '../components/Landing/LandingFooter';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light font-display text-slate-900">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
        <PreviewSection />
      </main>
      <LandingFooter />
    </div>
  );
}
