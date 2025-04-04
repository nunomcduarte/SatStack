import React from 'react';
import { getUserProfile } from '@/lib/services/userService';
import { getServerUser } from '@/lib/db/supabase-server';
import ProfileForm from '@/components/forms/ProfileForm';

export const metadata = {
  title: 'Profile | SatStack',
  description: 'Manage your SatStack profile and account settings',
};

export default async function ProfilePage() {
  const user = await getServerUser();
  
  // Redirect if not authenticated
  if (!user) {
    return null;
  }
  
  let profile = null;
  let error = null;
  
  try {
    profile = await getUserProfile(user.id);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    error = 'Failed to load profile. Please try again.';
  }

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Profile Settings
            </h1>
            <p className="mt-1 text-gray-500">
              Manage your personal information and account settings
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Profile Information */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            {profile ? (
              <ProfileForm profile={profile} />
            ) : !error ? (
              <div className="py-4 text-center text-gray-500">Loading profile information...</div>
            ) : null}
          </div>
          
          {/* Account Information */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Account ID</p>
                <p className="mt-1 text-sm text-gray-900">{user.id}</p>
              </div>

              {profile && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Subscription</p>
                  <div className="mt-1 flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {profile.subscription_tier}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {profile.subscription_status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-red-700 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Delete all your data from SatStack. This action cannot be undone.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 