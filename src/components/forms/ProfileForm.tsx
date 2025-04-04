'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserProfile } from '@/lib/services/userService';
import { useAuth } from '@/lib/auth/AuthContext';

// Form validation schema
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    subscription_tier: string;
    subscription_status: string | null;
  };
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setMessage(null);
      
      await updateUserProfile(profile.id, {
        first_name: data.first_name,
        last_name: data.last_name,
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully.' 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {message && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {message.text}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            autoComplete="given-name"
            {...register('first_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            autoComplete="family-name"
            {...register('last_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 