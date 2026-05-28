import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export interface PassRateDatum { label: string; passRate: number; runs: number; }

export function PassRateChart({ data, title }: { data: PassRateDatum[]; title: string }) {
  if (data.length === 0) return <p className="empty">No data</p>;
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 24 }}>
          <CartesianGrid stroke="#2a303c" />
          <XAxis dataKey="label" stroke="#8b9099" interval={0} angle={-25} dy={10} fontSize={11} />
          <YAxis stroke="#8b9099" domain={[0, 1]} fontSize={11} />
          <Tooltip contentStyle={{ background: '#1a1f29', border: '1px solid #2a303c' }} formatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
          <Bar dataKey="passRate" fill="#4cc9f0" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
