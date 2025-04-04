import React from 'react';
import Link from 'next/link';
import { getServerUser } from '@/lib/db/supabase-server';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import RecentTransactions from '@/components/transactions/RecentTransactions';

export const metadata = {
  title: 'Dashboard | SatStack',
  description: 'Your Bitcoin portfolio dashboard',
};

export default async function DashboardPage() {
  // In a real app, you would fetch the user and redirect if not authenticated
  const user = await getServerUser();
  
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {user ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Welcome{user.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Here's an overview of your Bitcoin portfolio
                </p>
              </div>
              <div className="mt-4 flex sm:mt-0 sm:ml-4">
                <Link
                  href="/dashboard/transactions/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Transaction
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You're viewing the dashboard in development mode without authentication.
                    In production, this page would require authentication.
                  </p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Update your .env.local file with real Supabase credentials</li>
                    <li>Create a real account via the sign-up page</li>
                    <li>Log in using real credentials</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-700"
                  >
                    Go to Login →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Portfolio Summary */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Portfolio Summary</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <PortfolioSummary />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <RecentTransactions />
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tax Report Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Tax Reports</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate tax reports for your Bitcoin transactions using FIFO method.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/tax-reports"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Tax Reports
                </Link>
              </div>
            </div>
          </div>

          {/* Manage Transactions Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all your Bitcoin transactions.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/transactions"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View All Transactions
                </Link>
              </div>
            </div>
          </div>

          {/* Account Settings Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account profile and subscription settings.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 