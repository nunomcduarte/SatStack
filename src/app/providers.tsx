'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "next-themes"
import { ToastProvider } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
    >
      <ToastProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 