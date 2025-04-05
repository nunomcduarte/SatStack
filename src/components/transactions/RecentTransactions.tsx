'use client';

import React from 'react';
import Link from 'next/link';
import { differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import { formatBitcoin, formatCurrency, formatDate } from '@/lib/utils/helpers';
import { TransactionType } from '@/lib/types';
import { useTransactionsStore, Transaction } from '@/lib/stores/transactionsStore';

interface RecentTransactionsProps {
  filter: string;
  timeframe: string;
}

export default function RecentTransactions({ filter, timeframe }: RecentTransactionsProps) {
  // Get transactions from the store
  const { transactions } = useTransactionsStore();
  
  // Fall back to mock data if no transactions in store
  const allTransactions = transactions.length > 0 ? transactions : [
    {
      id: '1',
      type: 'buy' as TransactionType,
      date: '2023-12-15',
      bitcoinAmount: 0.25,
      pricePerBitcoin: 41500,
      fiatAmount: 10375,
      fees: 25,
      description: 'Regular purchase'
    },
    {
      id: '2',
      type: 'buy' as TransactionType,
      date: '2023-11-20',
      bitcoinAmount: 0.5,
      pricePerBitcoin: 42000,
      fiatAmount: 21000,
      fees: 42,
      description: 'Dollar-cost averaging'
    },
    {
      id: '3',
      type: 'sell' as TransactionType,
      date: '2023-10-15',
      bitcoinAmount: 0.1,
      pricePerBitcoin: 45000,
      fiatAmount: 4500,
      fees: 15,
      description: 'Profit taking'
    },
    {
      id: '4',
      type: 'receive' as TransactionType,
      date: '2023-09-05',
      bitcoinAmount: 0.05,
      pricePerBitcoin: 40000,
      fiatAmount: 2000,
      fees: 0,
      description: 'Payment from client'
    },
    {
      id: '5',
      type: 'spend' as TransactionType,
      date: '2023-08-22',
      bitcoinAmount: 0.01,
      pricePerBitcoin: 38000,
      fiatAmount: 380,
      fees: 2,
      description: 'Online purchase'
    },
    {
      id: '6',
      type: 'send' as TransactionType,
      date: '2023-07-15',
      bitcoinAmount: 0.03,
      pricePerBitcoin: 36000,
      fiatAmount: 1080,
      fees: 5,
      description: 'Transfer to hardware wallet'
    },
    {
      id: '7',
      type: 'buy' as TransactionType,
      date: '2023-06-10',
      bitcoinAmount: 0.15,
      pricePerBitcoin: 35000,
      fiatAmount: 5250,
      fees: 12,
      description: 'Price dip opportunity'
    },
    {
      id: '8',
      type: 'receive' as TransactionType,
      date: '2023-05-05',
      bitcoinAmount: 0.02,
      pricePerBitcoin: 33000,
      fiatAmount: 660,
      fees: 0,
      description: 'Gift from friend'
    }
  ];

  // Filter transactions based on type and timeframe
  const filteredTransactions = transactions
    .filter(transaction => {
      // Filter by transaction type
      if (filter !== 'all' && transaction.type !== filter) {
        return false;
      }
      
      // Filter by timeframe
      if (timeframe !== 'all') {
        const txDate = new Date(transaction.date);
        const now = new Date();
        
        if (timeframe === 'year' && txDate.getFullYear() !== now.getFullYear()) {
          return false;
        } else if (timeframe === 'quarter') {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          if (txDate < threeMonthsAgo) {
            return false;
          }
        } else if (timeframe === 'month') {
          if (txDate.getMonth() !== now.getMonth() || 
              txDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }
      
      return true;
    });

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

  // Function to calculate holding days
  const calculateHoldingDays = (transaction: Transaction): number | null => {
    // For buy or receive transactions, calculate days from purchase until now
    if (transaction.type === 'buy' || transaction.type === 'receive') {
      const purchaseDate = new Date(transaction.date);
      const today = new Date();
      return differenceInDays(today, purchaseDate);
    }
    
    // For sell, send, or spend transactions, holding days doesn't apply
    return null;
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found with the selected filters.</p>
      </div>
    );
  }

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
                Fees
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Holding Days
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredTransactions.map((transaction) => (
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
                  {formatCurrency(transaction.fees || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatCurrency(transaction.fiatAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {calculateHoldingDays(transaction) !== null 
                    ? `${calculateHoldingDays(transaction)} days` 
                    : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {transaction.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredTransactions.length < allTransactions.length && (
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
      )}
    </div>
  );
} 