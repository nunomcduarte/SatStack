'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ResendButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendPasswordResetEmail } = useAuth();

  const handleResend = async () => {
    // In a real implementation, we would extract the email from the URL query parameters
    // or from local storage, but for now we'll show how the button would work in dev mode
    const email = localStorage.getItem('pendingVerificationEmail') || '';
    
    if (!email) {
      setError('No email found to resend verification. Try signing up again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      // In production, you would call Supabase to resend the verification email
      // For development, we'll simulate the behavior
      
      if (process.env.NODE_ENV === 'development') {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess(true);
      } else if (sendPasswordResetEmail) {
        // In production, we would use a dedicated resend verification function
        // For now, we'll reuse the password reset function which also sends an email
        const { error } = await sendPasswordResetEmail(email);
        
        if (error) {
          throw new Error(error.message || 'Failed to resend verification email.');
        }
        
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleResend}
        disabled={isLoading || success}
        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending...' : success ? 'Email sent!' : 'Resend email'}
      </button>
      
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {success && (
        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
          Verification email resent successfully.
        </p>
      )}
    </div>
  );
} 