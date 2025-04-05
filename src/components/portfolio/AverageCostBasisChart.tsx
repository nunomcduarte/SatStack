'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot 
} from 'recharts';

// Mock data for average cost basis over time
const data = [
  { month: 'Jan', cost: 28500 },
  { month: 'Feb', cost: 26000 },
  { month: 'Mar', cost: 27500 },
  { month: 'Apr', cost: 30000 },
  { month: 'May', cost: 32500 },
  { month: 'Jun', cost: 34000 },
  { month: 'Jul', cost: 35500 },
  { month: 'Aug', cost: 37000 },
  { month: 'Sep', cost: 38500 },
  { month: 'Oct', cost: 40200 },
  { month: 'Nov', cost: 41500 },
  { month: 'Dec', cost: 42500 }
];

const formatYAxis = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded border border-gray-700 shadow-lg">
        <p className="text-gray-200 text-sm">{label}</p>
        <p className="text-white font-medium">
          ${new Intl.NumberFormat('en-US').format(payload[0].value)}
        </p>
      </div>
    );
  }

  return null;
};

export default function AverageCostBasisChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#A0AEC0' }}
          axisLine={{ stroke: '#2D3748' }}
          tickLine={{ stroke: '#2D3748' }}
        />
        <YAxis 
          tickFormatter={formatYAxis} 
          tick={{ fill: '#A0AEC0' }}
          axisLine={{ stroke: '#2D3748' }}
          tickLine={{ stroke: '#2D3748' }}
          domain={[20000, 60000]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="cost" 
          name="Average Cost Basis"
          stroke="#805AD5" 
          strokeWidth={2}
          dot={{ fill: '#805AD5', strokeWidth: 2, r: 4, strokeDasharray: '' }}
          activeDot={{ r: 6, stroke: '#805AD5', fill: '#fff' }}
        />
        <ReferenceDot x="Dec" y={42500} r={6} fill="#805AD5" stroke="#fff" strokeWidth={2}>
        </ReferenceDot>
      </LineChart>
    </ResponsiveContainer>
  );
} 