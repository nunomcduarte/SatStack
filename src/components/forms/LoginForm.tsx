'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const [devMode, setDevMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (devMode) {
        // Development mode - simulate successful login
        console.log('Dev mode login:', data);
        // Wait a bit to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Redirect to dashboard
        router.push('/dashboard');
        return;
      }

      // Production mode - use Supabase auth
      if (signIn) {
        const { error } = await signIn(data.email, data.password);
        
        if (error) {
          throw new Error(error.message || 'Login failed. Please try again.');
        }
        
        // Redirect happens in AuthContext after successful login
      } else {
        throw new Error('Authentication system not initialized');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 text-sm rounded-md bg-red-50 text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              {...register('email')}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Password
            </label>
          </div>
          <div className="mt-2">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('rememberMe')}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/auth/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="devMode"
            name="devMode"
            type="checkbox"
            checked={devMode}
            onChange={(e) => setDevMode(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <label htmlFor="devMode" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
            Development mode (bypass Supabase auth)
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
} 