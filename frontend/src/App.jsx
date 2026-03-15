import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
      <Layout>
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/synthesize/:docId"   element={<Synthesize />} />
          <Route path="/validate/:id"        element={<Validate />} />
          <Route path="/execute/:id"         element={<Execute />} />
          <Route path="/dashboard"           element={<Dashboard />} />
          <Route path="/runbooks"            element={<RunbooksLibrary />} />
          <Route path="/runbooks/:id"        element={<RunbookDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
