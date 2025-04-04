import React from 'react';
import SignupForm from '@/components/forms/SignupForm';
import Link from 'next/link';

export const metadata = {
  title: 'Sign Up | SatStack',
  description: 'Create a new SatStack account',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create a new account
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <SignupForm />
        
        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 