import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LoanVolumeChart = ({ data }) => {
  if (!data) return <div>No data available</div>;

  // Expected data format: { 'Jan': 1500000, 'Feb': 2000000, ... }
  const chartData = Object.keys(data).map(key => ({
    month: key,
    volume: data[key]
  }));

  const formatYAxis = (tickItem) => {
    return `₹${(tickItem / 100000).toFixed(1)}L`; // Format as Lakhs
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} />
          <Tooltip 
            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Volume']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="volume" 
            stroke="#2563EB" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanVolumeChart;
