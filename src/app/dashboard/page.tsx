import React from 'react';
import DashboardClient from './DashboardClient';
import { getServerUser } from '@/lib/db/supabase-server';

export const metadata = {
  title: 'Dashboard | Bitcoin Tax Tracker',
  description: 'Your Bitcoin portfolio dashboard',
};

export default async function DashboardPage() {
  // In a real app, you would fetch the user and redirect if not authenticated
  const user = await getServerUser();
  
  return <DashboardClient user={user} />;
} 