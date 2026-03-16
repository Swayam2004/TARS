import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages — each manages its own layout
import Home            from './pages/Home';
import Synthesize      from './pages/Synthesize';
import Validate        from './pages/Validate';
import Execute         from './pages/Execute';
import Dashboard       from './pages/Dashboard';
import RunbooksLibrary from './pages/RunbooksLibrary';
import RunbookDetail   from './pages/RunbookDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — has its own Navbar + LandingFooter */}
        <Route path="/" element={<Home />} />

        {/* Workspace pages — each has WorkspaceHeader + FloatingAIButton */}
        <Route path="/synthesize/:docId" element={<Synthesize />} />
        <Route path="/validate/:id"      element={<Validate />} />
        <Route path="/execute/:id"       element={<Execute />} />
        <Route path="/runbooks/:id"      element={<RunbookDetail />} />

        {/* App pages — use AppLayout with top nav */}
        <Route path="/dashboard"         element={<Dashboard />} />
        <Route path="/runbooks"          element={<RunbooksLibrary />} />
      </Routes>
    </BrowserRouter>
  );
}
