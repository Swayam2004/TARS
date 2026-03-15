import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-sm px-3 py-2 text-xs space-y-1 border border-white/10">
      <div className="text-zinc-400 font-medium">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function ExecutionChart({ trend = [] }) {
  const data = trend.map(t => ({
    day:     t.day?.slice(5),   // MM-DD
    Success: t.success || 0,
    Failed:  t.failed  || 0,
  }));

  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
        No execution data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={12} barGap={2}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="day"
          tick={{ fill: '#71717a', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={v => <span style={{ color: '#a1a1aa' }}>{v}</span>}
        />
        <Bar dataKey="Success" fill="#10b981" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Failed"  fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
