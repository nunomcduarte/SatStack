'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Application Error
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              We're sorry, but something went wrong with the application.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                  <p className="font-medium">Error: {error.message || "An unknown error occurred"}</p>
                  {error.digest && (
                    <p className="text-sm mt-2">Error ID: {error.digest}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => reset()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try again
                  </button>
                  
                  <a
                    href="/"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Return to home
                  </a>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-yellow-800 dark:text-yellow-400">
                  <h3 className="text-sm font-medium">Development Note</h3>
                  <p className="mt-1 text-sm">
                    This error is likely related to a configuration issue. Please check:
                  </p>
                  <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                    <li>Environment variables in .env.local file</li>
                    <li>Supabase configuration and setup</li>
                    <li>Console logs for detailed error messages</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 