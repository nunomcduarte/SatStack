'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for holding period distribution
const data = [
  { period: '< 1 month', amount: 0.2, valueUSD: 12000 },
  { period: '1-3 months', amount: 0.35, valueUSD: 21000 },
  { period: '3-6 months', amount: 0.5, valueUSD: 30000 },
  { period: '6-12 months', amount: 0.8, valueUSD: 48000 },
  { period: '> 12 months', amount: 0.5, valueUSD: 30000 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded border border-gray-700 shadow-lg">
        <p className="text-gray-200 text-sm font-medium">{label}</p>
        <p className="text-white">
          {payload[0].value.toFixed(2)} BTC
        </p>
        <p className="text-gray-300 text-sm">
          ${new Intl.NumberFormat('en-US').format(
            payload[0].payload.valueUSD
          )}
        </p>
      </div>
    );
  }

  return null;
};

export default function HoldingPeriodChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
        <XAxis 
          dataKey="period" 
          tick={{ fill: '#A0AEC0' }}
          axisLine={{ stroke: '#2D3748' }}
          tickLine={{ stroke: '#2D3748' }}
        />
        <YAxis 
          tick={{ fill: '#A0AEC0' }}
          axisLine={{ stroke: '#2D3748' }}
          tickLine={{ stroke: '#2D3748' }}
          tickFormatter={(value) => `${value.toFixed(1)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="amount" 
          name="Bitcoin Amount" 
          fill="#3182CE" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 