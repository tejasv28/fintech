import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-card px-3 py-2 shadow-card">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="font-mono text-sm font-semibold text-ink-900">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
    </div>
  );
};

const LoanVolumeChart = ({ data }) => {
  if (!data) return <div className="text-sm text-ink-300">No data available</div>;
  const chartData = Object.keys(data).map(key => ({ month: key, volume: data[key] }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 16, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8B92A3', fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B92A3', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="volume" stroke="#6C5CE7" strokeWidth={2.5} dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#6C5CE7' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanVolumeChart;
