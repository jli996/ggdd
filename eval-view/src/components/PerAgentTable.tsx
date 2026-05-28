import type { SuiteSummary } from '../lib/dataLoader.ts';

export function PerAgentTable({ summary }: { summary: SuiteSummary }) {
  const rows = Object.entries(summary.byAgent).sort((a, b) => b[1].passRate - a[1].passRate);
  if (rows.length === 0) return <p className="empty">No agents recorded</p>;
  return (
    <table>
      <thead><tr><th>Agent</th><th>Runs</th><th>Pass Rate</th></tr></thead>
      <tbody>
        {rows.map(([agent, stats]) => (
          <tr key={agent}>
            <td>{agent}</td>
            <td>{stats.runs}</td>
            <td className={stats.passRate >= 0.7 ? 'pass' : 'fail'}>{(stats.passRate * 100).toFixed(0)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
