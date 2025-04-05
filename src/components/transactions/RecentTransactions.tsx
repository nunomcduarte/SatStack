'use client';

import React from 'react';
import Link from 'next/link';
import { formatBitcoin, formatCurrency, formatDate } from '@/lib/utils/helpers';
import { TransactionType } from '@/lib/types';

export default function RecentTransactions() {
  // This is a placeholder component for now
  // We'll implement actual data fetching from Supabase later
  const mockTransactions = [
    {
      id: '1',
      type: 'buy' as TransactionType,
      date: '2023-12-15',
      bitcoinAmount: 0.25,
      pricePerBitcoin: 41500,
      fiatAmount: 10375,
      description: 'Regular purchase'
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
      date: '2023-10-15',
      bitcoinAmount: 0.1,
      pricePerBitcoin: 45000,
      fiatAmount: 4500,
      description: 'Profit taking'
    },
    {
      id: '4',
      type: 'receive' as TransactionType,
      date: '2023-09-05',
      bitcoinAmount: 0.05,
      pricePerBitcoin: 40000,
      fiatAmount: 2000,
      description: 'Payment from client'
    },
    {
      id: '5',
      type: 'spend' as TransactionType,
      date: '2023-08-22',
      bitcoinAmount: 0.01,
      pricePerBitcoin: 38000,
      fiatAmount: 380,
      description: 'Online purchase'
    }
  ];

  // Function to get appropriate styling based on transaction type
  const getTransactionTypeStyle = (type: TransactionType) => {
    switch (type) {
      case 'buy':
        return 'bg-green-900 text-green-300';
      case 'sell':
        return 'bg-red-900 text-red-300';
      case 'send':
        return 'bg-yellow-900 text-yellow-300';
      case 'receive':
        return 'bg-blue-900 text-blue-300';
      case 'spend':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {mockTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeStyle(transaction.type)}`}>
                    {transaction.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatBitcoin(transaction.bitcoinAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatCurrency(transaction.pricePerBitcoin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatCurrency(transaction.fiatAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {transaction.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-4 pb-2 border-t border-gray-800 mt-4">
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          View All Transactions
          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
} 