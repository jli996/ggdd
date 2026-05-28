import { Routes, Route, Link } from 'react-router-dom';
import { Overview } from './components/Overview.tsx';
import { RunDetail } from './components/RunDetail.tsx';

export function App() {
  return (
    <div className="app">
      <header className="header">
        <h1><Link to="/">ggdd · eval-view</Link></h1>
        <span className="muted">Unity 6 guidance evaluation dashboard</span>
      </header>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/runs/:stamp/:agent/:guideId" element={<RunDetail />} />
      </Routes>
    </div>
  );
}
