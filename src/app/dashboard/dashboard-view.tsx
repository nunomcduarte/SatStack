"use client"

import { useState } from "react"
import { ArrowUpIcon, CalendarIcon, DollarSignIcon, DownloadIcon, PlusIcon, WalletIcon } from "lucide-react"

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

export default function DashboardView() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2023")

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
              <WalletIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₿ 2.35</div>
              <p className="text-xs text-gray-400">$142,350.00 USD</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Cost Basis</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$42,500.00</div>
              <p className="text-xs text-gray-400">Per Bitcoin</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unrealized P/L</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">+$18,275.00</div>
              <p className="text-xs text-green-500">+14.7% from cost basis</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realized Gains (2023)</CardTitle>
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,450.00</div>
              <div className="flex items-center">
                <p className="text-xs text-gray-400 mr-2">Tax estimate: $1,267.50</p>
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
            <PortfolioOverview />
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <TransactionHistory />
          </TabsContent>
          <TabsContent value="tax" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Tax Summary</h2>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TaxSummary year={selectedYear} />
          </TabsContent>
        </Tabs>
      </main>

      <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} />
    </div>
  )
} 