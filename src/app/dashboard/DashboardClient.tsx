'use client';

import { User } from '@supabase/supabase-js';
import DashboardView from './dashboard-view';

interface DashboardClientProps {
  user: User | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!user && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-300">Development Mode</h3>
                <div className="mt-2 text-sm text-yellow-200">
                  <p>
                    You're viewing the dashboard in development mode without authentication.
                    In production, this page would require authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DashboardView />
    </div>
  );
} 