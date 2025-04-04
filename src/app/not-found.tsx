import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          We couldn't find the page you're looking for.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
              <p>The page you requested could not be found. It might have been moved, deleted, or never existed.</p>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Home
              </Link>
              
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Go to Login
              </Link>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-yellow-800 dark:text-yellow-400">
              <h3 className="text-sm font-medium">Development Note</h3>
              <p className="mt-1 text-sm">
                This application is running in development mode. The following pages are available:
              </p>
              <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                <li>Home: <code>/</code></li>
                <li>Login: <code>/auth/login</code></li>
                <li>Signup: <code>/auth/signup</code></li>
                <li>Dashboard: <code>/dashboard</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 