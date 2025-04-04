'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

// Form validation schema
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const [devMode, setDevMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Store email in localStorage for development purposes
      // This allows the ResendButton in the verification page to work in dev mode
      localStorage.setItem('pendingVerificationEmail', data.email);

      if (devMode) {
        // Development mode - simulate successful signup
        console.log('Dev mode signup:', data);
        // Wait a bit to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Redirect to email verification page
        router.push('/auth/verify-email');
        return;
      }

      // Production mode - use Supabase auth
      if (signUp) {
        const { error } = await signUp(data.email, data.password);
        
        if (error) {
          throw new Error(error.message || 'Signup failed. Please try again.');
        }
        
        // Redirect to email verification page
        router.push('/auth/verify-email');
      } else {
        throw new Error('Authentication system not initialized');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 text-sm rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
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
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
            Password
          </label>
          <div className="mt-2">
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              {...register('password')}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
            Confirm password
          </label>
          <div className="mt-2">
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
            )}
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
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
} 