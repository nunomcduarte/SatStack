'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for portfolio value over time
const data = [
  { month: 'Jan', value: 42000 },
  { month: 'Feb', value: 38500 },
  { month: 'Mar', value: 40200 },
  { month: 'Apr', value: 45600 },
  { month: 'May', value: 52300 },
  { month: 'Jun', value: 58000 },
  { month: 'Jul', value: 72500 },
  { month: 'Aug', value: 78000 },
  { month: 'Sep', value: 83200 },
  { month: 'Oct', value: 95000 },
  { month: 'Nov', value: 110000 },
  { month: 'Dec', value: 142350 }
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

export default function PortfolioValueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
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
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#4F46E5" 
          strokeWidth={2}
          dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4, strokeDasharray: '' }}
          activeDot={{ r: 6, stroke: '#4F46E5', fill: '#fff' }}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 