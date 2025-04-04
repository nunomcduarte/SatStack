'use client';

import React from 'react';
import { formatBitcoin, formatCurrency, calculatePercentageChange } from '@/lib/utils/helpers';

export default function PortfolioSummary() {
  // This is a placeholder component for now
  // We'll implement actual data fetching and calculations later
  const mockData = {
    totalBitcoin: 1.25,
    averageCostBasis: 42000,
    totalFiatInvested: 52500,
    currentValue: 56250,
    unrealizedGainLoss: 3750,
    unrealizedGainLossPercentage: 7.14
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Total Bitcoin</p>
          <p className="text-2xl font-semibold">{formatBitcoin(mockData.totalBitcoin)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Average Cost Basis</p>
          <p className="text-2xl font-semibold">{formatCurrency(mockData.averageCostBasis)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Total Invested</p>
          <p className="text-2xl font-semibold">{formatCurrency(mockData.totalFiatInvested)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="text-2xl font-semibold">{formatCurrency(mockData.currentValue)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Unrealized Gain/Loss</p>
          <p className={`text-2xl font-semibold ${mockData.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(mockData.unrealizedGainLoss)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Percentage Change</p>
          <p className={`text-2xl font-semibold ${mockData.unrealizedGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {mockData.unrealizedGainLossPercentage.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
} 