import React from 'react';
import LoginForm from '@/components/forms/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login | SatStack',
  description: 'Log in to your SatStack account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm />
        
        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
            Create an account
          </Link>
        </p>
        
        <div className="mt-4 text-center">
          <Link href="/auth/reset-password" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
} 