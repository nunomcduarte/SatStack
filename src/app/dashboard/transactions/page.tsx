import React from 'react';
import Link from 'next/link';
import { getTransactions } from '@/lib/services/transactionService';
import { formatDate, formatBitcoin, formatCurrency } from '@/lib/utils/helpers';
import { getServerUser } from '@/lib/db/supabase-server';
import { Transaction } from '@/lib/types';

export const metadata = {
  title: 'Transactions | SatStack',
  description: 'Manage your Bitcoin transactions',
};

export default async function TransactionsPage() {
  const user = await getServerUser();
  
  // Redirect if not authenticated
  if (!user) {
    return null;
  }
  
  let transactions: Transaction[] = [];
  let error = null;
  
  try {
    transactions = await getTransactions(user.id);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    error = 'Failed to load transactions. Please try again.';
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Transactions
            </h1>
            <p className="mt-1 text-gray-500">
              Manage your Bitcoin transactions
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/dashboard/transactions/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Transaction
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {transactions.length === 0 && !error ? (
          <div className="bg-white shadow rounded-lg py-8 px-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by adding your first Bitcoin transaction.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/transactions/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add First Transaction
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <li key={transaction.id}>
                  <Link 
                    href={`/dashboard/transactions/${transaction.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {transaction.type} {formatBitcoin(transaction.bitcoin_amount)} BTC
                          </p>
                          <div className={`ml-2 flex-shrink-0 inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            transaction.type === 'BUY' || transaction.type === 'RECEIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {formatCurrency(transaction.price_per_bitcoin)} per BTC
                          </p>
                          {transaction.exchange && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {transaction.exchange}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {formatCurrency(transaction.fiat_amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 