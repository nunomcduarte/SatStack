"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import RecentTransactions from '@/components/transactions/RecentTransactions'
import { Button } from '@/components/ui/button'
import { DownloadIcon, FilterIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TransactionHistory() {
  const [filter, setFilter] = useState('all')
  const [timeframe, setTimeframe] = useState('year')
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="spend">Spend</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {timeframe === 'all' ? 'All transactions' : 
             timeframe === 'year' ? 'Transactions from the current year' :
             timeframe === 'quarter' ? 'Transactions from the last 3 months' :
             'Transactions from the current month'}
            {filter !== 'all' && ` (filtered by ${filter} type)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions filter={filter} timeframe={timeframe} />
        </CardContent>
      </Card>

      <div className="flex justify-between items-center px-2">
        <p className="text-sm text-muted-foreground">
          Showing {filter === 'all' ? 'all' : filter} transactions
          {timeframe !== 'all' && ` for ${timeframe === 'year' ? 'this year' : 
                                  timeframe === 'quarter' ? 'the last 3 months' : 
                                  'this month'}`}
        </p>
        <Button variant="link" size="sm">View All Transaction History</Button>
      </div>
    </div>
  )
} 