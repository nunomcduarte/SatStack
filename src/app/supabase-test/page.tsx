'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SupabaseTestPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/supabase-test');
        const data = await response.json();
        
        setResult(data);
      } catch (err: any) {
        console.error('Error testing Supabase connection:', err);
        setError(err.message || 'Failed to test Supabase connection');
      } finally {
        setIsLoading(false);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Supabase Connection Test
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Testing connection to your Supabase project
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                <p className="font-medium">Error: {error}</p>
              </div>
            ) : (
              <div className={`p-4 ${result?.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'} rounded-md`}>
                <p className="font-medium">Status: {result?.status}</p>
                <p className="mt-1">{result?.message}</p>
                
                {result?.connectionTest && (
                  <p className="mt-1">Connection Test: {result.connectionTest}</p>
                )}
                
                {result?.error && (
                  <p className="mt-1">Error: {result.error}</p>
                )}
                
                <div className="mt-4">
                  <h3 className="font-medium">Environment Variables:</h3>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Supabase URL: {result?.env?.supabaseUrl}</li>
                    <li>Supabase Anon Key: {result?.env?.supabaseAnonKey}</li>
                    <li>Node Environment: {result?.env?.nodeEnv}</li>
                  </ul>
                </div>
                
                {result?.data && (
                  <div className="mt-4">
                    <h3 className="font-medium">Response Data:</h3>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Test Again
              </button>
              
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 