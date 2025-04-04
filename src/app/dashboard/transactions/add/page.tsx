import React from 'react';
import TransactionForm from '@/components/transactions/TransactionForm';

export const metadata = {
  title: 'Add Transaction | SatStack',
  description: 'Add a new Bitcoin transaction to your portfolio',
};

export default function AddTransactionPage() {
  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Add New Transaction
            </h1>
            <p className="mt-1 text-gray-500">
              Record a new Bitcoin transaction to track in your portfolio
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <TransactionForm />
        </div>
      </div>
    </div>
  );
} 