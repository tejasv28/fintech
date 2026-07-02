import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = { 'PENDING': '#8B92A3', 'UNDER REVIEW': '#2D9CDB', 'APPROVED': '#00B37E', 'REJECTED': '#F0426B', 'MANUAL REVIEW': '#FF9F1C' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-card px-3 py-2 shadow-card">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="font-mono text-sm font-semibold text-ink-900">{payload[0].value}</p>
    </div>
  );
};

const ApplicationStatusChart = ({ data }) => {
  if (!data) return <div className="text-sm text-ink-300">No data available</div>;
  const chartData = Object.keys(data).map(key => ({ name: key.replace('_', ' '), count: data[key] }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8B92A3', fontSize: 11, fontFamily: 'Inter' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B92A3', fontSize: 11, fontFamily: 'Inter' }} />
          <Tooltip cursor={{ fill: '#FAFAF9' }} content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => <Cell key={index} fill={COLORS[entry.name] || '#6C5CE7'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ApplicationStatusChart;
