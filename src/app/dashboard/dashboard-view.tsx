"use client"

import { useState, useEffect } from "react"
import { ArrowUpIcon, CalendarIcon, DollarSignIcon, DownloadIcon, PlusIcon, WalletIcon, TrashIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import PortfolioOverview from "./portfolio-overview"
import TransactionHistory from "./transaction-history"
import TaxSummary from "./tax-summary"
import AddTransactionModal from "./add-transaction-modal"
import { useTransactionsStore } from "@/lib/stores/transactionsStore"
import { TransactionType, Transaction } from '@/lib/types'
import { LivePriceDisplay } from "@/components/bitcoin/LivePriceDisplay"
import { getCurrentPrice } from "@/lib/services/priceService"
import { BitcoinPriceCard } from "@/components/bitcoin/BitcoinPriceCard"

export default function DashboardView() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")
  const currentYear = new Date().getFullYear().toString()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentBtcPrice, setCurrentBtcPrice] = useState(0)
  
  const { transactions, clearTransactions } = useTransactionsStore()
  
  // Generate an array of years (current year and 4 years back)
  const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 4 + i + 1).toString())
  
  // Fetch current BTC price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getCurrentPrice()
        setCurrentBtcPrice(price)
      } catch (error) {
        console.error("Error fetching Bitcoin price:", error)
        // Fallback to a default price if API fails
        setCurrentBtcPrice(60000)
      }
    }
    
    fetchPrice()
    
    // Refresh price every 5 minutes
    const intervalId = setInterval(fetchPrice, 300000)
    
    return () => clearInterval(intervalId)
  }, [])
  
  // Calculate summary values from transactions
  const totalHoldings = calculateTotalHoldings(transactions, currentBtcPrice)
  const averageCostBasis = calculateAverageCostBasis(transactions)
  const unrealizedPL = calculateUnrealizedPL(transactions, currentBtcPrice)
  const realizedGains = calculateRealizedGains(transactions, selectedYear)
  
  // Listen for transaction updates
  useEffect(() => {
    const handleTransactionUpdate = () => {
      // Force component re-render when transactions are updated
      setRefreshKey(prevKey => prevKey + 1);
    };
    
    window.addEventListener('transaction-added', handleTransactionUpdate);
    
    return () => {
      window.removeEventListener('transaction-added', handleTransactionUpdate);
    };
  }, []);

  return (
    <div className="w-full">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <LivePriceDisplay compact className="ml-4" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsAddTransactionOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <BitcoinPriceCard />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
              <WalletIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₿ {totalHoldings.btc.toFixed(8)}</div>
              <p className="text-xs text-gray-400">${totalHoldings.usd.toLocaleString()} USD</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Cost Basis</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageCostBasis.toLocaleString()}</div>
              <p className="text-xs text-gray-400">Per Bitcoin</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unrealized P/L</CardTitle>
              <ArrowUpIcon className={`h-4 w-4 ${unrealizedPL.amount >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${unrealizedPL.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {unrealizedPL.amount >= 0 ? '+' : ''}{unrealizedPL.amount.toLocaleString()}
              </div>
              <p className={`text-xs ${unrealizedPL.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {unrealizedPL.percent >= 0 ? '+' : ''}{unrealizedPL.percent.toFixed(2)}% from cost basis
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realized Gains ({selectedYear})</CardTitle>
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${realizedGains.gains.toLocaleString()}</div>
              <div className="flex items-center">
                <p className="text-xs text-gray-400 mr-2">Tax estimate: ${realizedGains.tax.toLocaleString()}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4">
                      <DownloadIcon className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Tax Reports</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Download CSV</DropdownMenuItem>
                    <DropdownMenuItem>Download PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="tax">Tax Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <PortfolioOverview key={`overview-${refreshKey}`} timeframe={selectedTimeframe} />
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <TransactionHistory key={`transactions-${refreshKey}`} />
          </TabsContent>
          <TabsContent value="tax" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Tax Summary</h2>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TaxSummary key={`tax-${refreshKey}`} year={selectedYear} />
          </TabsContent>
        </Tabs>
      </main>

      <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} />
    </div>
  )
}

// Calculation functions for dashboard metrics with proper TypeScript types
function calculateTotalHoldings(transactions: any[], currentPrice: number): { btc: number, usd: number } {
  // Default values for empty state
  if (!transactions || transactions.length === 0) {
    return { btc: 0, usd: 0 };
  }
  
  let totalBtc = 0;
  
  transactions.forEach(tx => {
    if (tx.type === 'buy' || tx.type === 'receive') {
      totalBtc += tx.bitcoinAmount || tx.bitcoin_amount;
    } else if (tx.type === 'sell' || tx.type === 'send') {
      totalBtc -= tx.bitcoinAmount || tx.bitcoin_amount;
    }
  });
  
  return {
    btc: totalBtc,
    usd: totalBtc * currentPrice
  };
}

function calculateAverageCostBasis(transactions: any[]): number {
  // Default value for empty state
  if (!transactions || transactions.length === 0) {
    return 0;
  }
  
  let totalBtc = 0;
  let totalCost = 0;
  
  transactions.forEach(tx => {
    if (tx.type === 'buy') {
      totalBtc += tx.bitcoinAmount || tx.bitcoin_amount;
      totalCost += tx.fiatAmount || tx.fiat_amount;
    }
  });
  
  return totalBtc > 0 ? (totalCost / totalBtc) : 0;
}

function calculateUnrealizedPL(transactions: any[], currentPrice: number): { amount: number, percent: number } {
  // Default values for empty state
  if (!transactions || transactions.length === 0) {
    return { amount: 0, percent: 0 };
  }
  
  const holdings = calculateTotalHoldings(transactions, currentPrice);
  const avgCostBasis = calculateAverageCostBasis(transactions);
  const totalCost = holdings.btc * avgCostBasis;
  const currentValue = holdings.usd;
  
  const plAmount = currentValue - totalCost;
  const plPercent = totalCost > 0 ? (plAmount / totalCost) * 100 : 0;
  
  return {
    amount: plAmount,
    percent: plPercent
  };
}

function calculateRealizedGains(transactions: any[], year: string): { gains: number, tax: number } {
  // Default values for empty state
  if (!transactions || transactions.length === 0) {
    return { gains: 0, tax: 0 };
  }
  
  let totalGains = 0;
  
  transactions.forEach(tx => {
    if (tx.type === 'sell' && tx.date.startsWith(year)) {
      const costBasis = (tx.bitcoinAmount || tx.bitcoin_amount) * calculateAverageCostBasis(transactions);
      const proceeds = tx.fiatAmount || tx.fiat_amount;
      totalGains += proceeds - costBasis;
    }
  });
  
  // Simplified tax calculation (15% capital gains tax)
  const taxEstimate = totalGains > 0 ? totalGains * 0.15 : 0;
  
  return {
    gains: totalGains,
    tax: taxEstimate
  };
} 