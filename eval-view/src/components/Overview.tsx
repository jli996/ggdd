import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadIndex, loadSummary, loadAllRuns, type RunIndex, type SuiteSummary, type RunResult } from '../lib/dataLoader.ts';
import { PassRateChart } from './PassRateChart.tsx';
import { PerAgentTable } from './PerAgentTable.tsx';

export function Overview() {
  const [index, setIndex] = useState<RunIndex>({ stamps: [] });
  const [summary, setSummary] = useState<SuiteSummary | null>(null);
  const [runs, setRuns] = useState<RunResult[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<string>('');

  useEffect(() => { loadIndex().then(idx => {
    setIndex(idx);
    const latest = idx.stamps.at(-1)?.stamp ?? '';
    setSelectedStamp(latest);
  }); }, []);

  useEffect(() => {
    if (!selectedStamp) return;
    loadSummary(selectedStamp).then(setSummary);
    loadAllRuns(selectedStamp, index).then(setRuns);
  }, [selectedStamp, index]);

  if (index.stamps.length === 0) return (
    <div className="panel"><p className="empty">No runs yet. Run <code>ggdd-dev eval</code> to populate.</p></div>
  );

  return (
    <div>
      <div className="panel">
        <label>
          Run:{' '}
          <select value={selectedStamp} onChange={e => setSelectedStamp(e.target.value)}>
            {index.stamps.map(s => <option key={s.stamp} value={s.stamp}>{s.stamp}</option>)}
          </select>
        </label>
      </div>
      <div className="grid">
        <div className="panel">
          {summary && (
            <PassRateChart
              title="Pass rate by category"
              data={Object.entries(summary.byCategory).map(([label, s]) => ({ label, passRate: s.passRate, runs: s.runs }))}
            />
          )}
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Agents</h3>
          {summary && <PerAgentTable summary={summary} />}
        </div>
      </div>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Runs</h3>
        <table>
          <thead><tr><th>Agent</th><th>Guide</th><th>Pass</th><th>Total</th><th>Rate</th><th></th></tr></thead>
          <tbody>
            {runs.map(r => (
              <tr key={`${r.agent}-${r.guideId}`}>
                <td>{r.agent}</td>
                <td>{r.guideId}</td>
                <td>{r.grader.pass}</td>
                <td>{r.grader.total}</td>
                <td className={r.grader.rate >= 0.7 ? 'pass' : 'fail'}>{(r.grader.rate * 100).toFixed(0)}%</td>
                <td><Link to={`/runs/${selectedStamp}/${r.agent}/${r.guideId}`}>detail →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
