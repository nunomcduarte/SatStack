'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-right" />
      </AuthProvider>
    </ToastProvider>
  );
} 