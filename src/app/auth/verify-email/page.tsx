import React from 'react';
import Link from 'next/link';
import ResendButton from '@/components/ui/ResendButton';

export const metadata = {
  title: 'Verify Email | SatStack',
  description: 'Verify your email address to continue',
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Check your email
        </h1>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            We've sent a verification link to your email address.
            Please click the link to verify your account.
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 px-6 py-8 shadow sm:rounded-lg sm:px-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Next steps
              </h2>
              <ul className="mt-4 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>Check your email inbox</li>
                <li>Click the verification link in the email</li>
                <li>You'll be redirected to complete your profile</li>
                <li>If you don't see the email, check your spam folder</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Return to login
                </Link>
              </div>
              <div className="text-sm">
                <ResendButton />
              </div>
            </div>
          </div>
        </div>

        {/* Development mode instructions */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 px-6 py-4 shadow sm:rounded-lg sm:px-8 border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-base font-medium text-yellow-800 dark:text-yellow-400">Development Mode</h3>
          <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            Since you're in development mode without a real Supabase connection, 
            you can simulate a verified user by going directly to the dashboard.
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 