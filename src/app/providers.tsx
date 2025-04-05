'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from "@/components/ui/toast"
import { TaxSettingsProvider } from '@/lib/contexts/taxSettingsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <TaxSettingsProvider>
          {children}
          <Toaster position="top-right" />
        </TaxSettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
} 