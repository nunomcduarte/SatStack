'use client';

import React from 'react';
import { formatBitcoin, formatCurrency, formatDate } from '@/lib/utils/helpers';
import { TransactionType } from '@/lib/types';

export default function RecentTransactions() {
  // This is a placeholder component for now
  // We'll implement actual data fetching from Supabase later
  const mockTransactions = [
    {
      id: '1',
      type: 'buy' as TransactionType,
      date: '2023-10-15',
      bitcoinAmount: 0.25,
      pricePerBitcoin: 40000,
      fiatAmount: 10000,
      description: 'Initial purchase'
    },
    {
      id: '2',
      type: 'buy' as TransactionType,
      date: '2023-11-20',
      bitcoinAmount: 0.5,
      pricePerBitcoin: 42000,
      fiatAmount: 21000,
      description: 'Dollar-cost averaging'
    },
    {
      id: '3',
      type: 'sell' as TransactionType,
      date: '2023-12-15',
      bitcoinAmount: 0.1,
      pricePerBitcoin: 45000,
      fiatAmount: 4500,
      description: 'Profit taking'
    }
  ];

  // Function to get appropriate styling based on transaction type
  const getTransactionTypeStyle = (type: TransactionType) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'sell':
        return 'bg-red-100 text-red-800';
      case 'send':
        return 'bg-yellow-100 text-yellow-800';
      case 'receive':
        return 'bg-blue-100 text-blue-800';
      case 'spend':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockTransactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeStyle(transaction.type)}`}>
                  {transaction.type.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatBitcoin(transaction.bitcoinAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(transaction.pricePerBitcoin)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(transaction.fiatAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-6 py-4 border-t border-gray-200">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View All Transactions
        </button>
      </div>
    </div>
  );
} 