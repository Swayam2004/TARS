import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2 text-xs space-y-1">
      <div className="text-slate-500 font-medium">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function ExecutionChart({ trend = [] }) {
  const data = trend.map(t => ({
    day:     t.day?.slice(5),
    Success: t.success || 0,
    Failed:  t.failed  || 0,
  }));

  if (!data.length) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
        <span className="material-symbols-outlined text-3xl text-slate-300">bar_chart</span>
        No execution data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={12} barGap={2}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="day"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,23,42,0.03)' }} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={v => <span style={{ color: '#64748b' }}>{v}</span>}
        />
        <Bar dataKey="Success" fill="#10b981" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Failed"  fill="#f87171" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
