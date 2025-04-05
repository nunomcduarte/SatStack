'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, LineChart, Wallet, FileText } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-wrap gap-2 p-4 bg-gray-900 border-b border-gray-800">
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-gray-50",
          pathname === "/dashboard" ? "bg-gray-800" : "hover:bg-gray-800"
        )}
      >
        <LayoutDashboard className="h-5 w-5" />
        Dashboard
      </Link>
      <Link
        href="/transactions"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-gray-50",
          pathname === "/transactions" ? "bg-gray-800" : "hover:bg-gray-800"
        )}
      >
        <LineChart className="h-5 w-5" />
        Transactions
      </Link>
      <Link
        href="/portfolio"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-gray-50",
          pathname === "/portfolio" ? "bg-gray-800" : "hover:bg-gray-800"
        )}
      >
        <Wallet className="h-5 w-5" />
        Portfolio
      </Link>
      <Link
        href="/tax-reports"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-gray-50",
          pathname === "/tax-reports" ? "bg-gray-800" : "hover:bg-gray-800"
        )}
      >
        <FileText className="h-5 w-5" />
        Tax Reports
      </Link>
    </nav>
  );
} 