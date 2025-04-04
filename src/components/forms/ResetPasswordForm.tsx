'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useAuth } from '@/lib/auth/AuthContext';

// Determine if we're on the reset page (with token) or request page
const isResetPage = typeof window !== 'undefined' && window.location.search.includes('token=');

// Form validation schema - different for reset request vs actual reset
const resetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetRequestData = z.infer<typeof resetRequestSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { resetPassword, sendPasswordResetEmail } = useAuth();
  
  // Use different form setup based on whether we're resetting or requesting
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm<ResetRequestData>({
    resolver: zodResolver(resetRequestSchema),
  });

  // Handle reset password request (send email)
  const onRequestReset = async (data: ResetRequestData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (sendPasswordResetEmail) {
        const { error } = await sendPasswordResetEmail(data.email);
        
        if (error) {
          throw new Error(error.message || 'Failed to send reset email. Please try again.');
        }
        
        setSuccess('Password reset email sent. Please check your inbox.');
      } else {
        throw new Error('Authentication system not initialized');
      }
    } catch (err: any) {
      console.error('Reset request error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle actual password reset (with token)
  const onResetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        throw new Error('Reset token not found. Please try again or request a new reset link.');
      }
      
      if (resetPassword) {
        const { error } = await resetPassword(token, data.password);
        
        if (error) {
          throw new Error(error.message || 'Failed to reset password. Please try again.');
        }
        
        setSuccess('Password successfully reset. You can now log in with your new password.');
      } else {
        throw new Error('Authentication system not initialized');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render different forms based on whether we're resetting or requesting
  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-4 text-sm rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 text-sm rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}
      
      {isResetPage ? (
        <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              New Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                {...registerReset('password')}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
              />
              {errorsReset.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorsReset.password.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Confirm New Password
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                {...registerReset('confirmPassword')}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
              />
              {errorsReset.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorsReset.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitRequest(onRequestReset)} className="space-y-6">
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
                {...registerRequest('email')}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
              />
              {errorsRequest.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorsRequest.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 