import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadRun, type RunResult } from '../lib/dataLoader.ts';

export function RunDetail() {
  const { stamp, agent, guideId } = useParams<{ stamp: string; agent: string; guideId: string }>();
  const [run, setRun] = useState<RunResult | null>(null);

  useEffect(() => {
    if (!stamp || !agent || !guideId) return;
    loadRun(stamp, agent, guideId).then(setRun);
  }, [stamp, agent, guideId]);

  if (!run) return <div className="panel"><p className="empty">Loading run…</p></div>;

  return (
    <div>
      <p><Link to="/">← back to overview</Link></p>
      <div className="panel">
        <h2>{run.agent} × {run.guideId}</h2>
        <p className="muted">
          {run.modelVersion} · {(run.grader.rate * 100).toFixed(0)}% pass
          ({run.grader.pass}/{run.grader.total}) ·
          agent {(run.agentDurationMs / 1000).toFixed(1)}s ·
          total {(run.totalDurationMs / 1000).toFixed(1)}s
          {run.costUsd != null && ` · $${run.costUsd.toFixed(4)}`}
        </p>
      </div>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Per-assertion</h3>
        {run.grader.perAssertion.length === 0 ? (
          <p className="empty">Per-assertion detail not recorded.</p>
        ) : (
          <table>
            <thead><tr><th></th><th>Assertion</th><th>Message</th></tr></thead>
            <tbody>
              {run.grader.perAssertion.map((a, i) => (
                <tr key={i}>
                  <td className={a.passed ? 'pass' : 'fail'}>{a.passed ? '✓' : '✗'}</td>
                  <td>{a.name}</td>
                  <td className="muted">{a.message ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
