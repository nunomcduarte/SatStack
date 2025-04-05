"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RecentTransactions from '@/components/transactions/RecentTransactions'

export default function TransactionHistory() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions />
        </CardContent>
      </Card>
    </div>
  )
} 