"use client"

import { useState, useMemo } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DownloadIcon, 
  ArrowUpDown,
  Filter,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction } from "@/lib/stores/transactionsStore"
import { useTaxSettings } from "@/lib/contexts/taxSettingsContext"

// Helper function to find a matching "buy" transaction for a "sell" based on cost basis method
function findMatchingBuyTransaction(
  transactions: Transaction[], 
  sellTransaction: Transaction,
  costBasisMethod: string,
) {
  // Get all buy transactions before this sell
  const buyTransactions = transactions.filter(tx => 
    tx.type === 'buy' && 
    new Date(tx.date) < new Date(sellTransaction.date)
  );
  
  if (buyTransactions.length === 0) return null;
  
  let sortedBuyTransactions;
  
  switch (costBasisMethod) {
    case 'fifo': // First In, First Out - oldest first
      sortedBuyTransactions = [...buyTransactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      break;
    case 'lifo': // Last In, First Out - newest first
      sortedBuyTransactions = [...buyTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      break;
    case 'hifo': // Highest In, First Out - highest cost first
      sortedBuyTransactions = [...buyTransactions].sort(
        (a, b) => b.pricePerBitcoin - a.pricePerBitcoin
      );
      break;
    default:
      sortedBuyTransactions = [...buyTransactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }
  
  return sortedBuyTransactions.length > 0 ? sortedBuyTransactions[0] : null;
}

// Calculate holding period in days
function calculateHoldingDays(buyDate: string, sellDate: string): number {
  const buyDateTime = new Date(buyDate).getTime();
  const sellDateTime = new Date(sellDate).getTime();
  return Math.floor((sellDateTime - buyDateTime) / (1000 * 60 * 60 * 24));
}

interface CapitalGainTransaction {
  id: string;
  date: string;
  bitcoinAmount: number;
  costBasis: number;
  proceeds: number;
  gain: number;
  holdingPeriod: "short" | "long";
  daysHeld: number;
  originalTransaction: Transaction;
}

interface CapitalGainsReportProps {
  year: string;
  transactions: Transaction[];
}

export default function CapitalGainsReport({ year, transactions }: CapitalGainsReportProps) {
  const [sortBy, setSortBy] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [filterBy, setFilterBy] = useState("all")
  const { settings } = useTaxSettings();
  
  // Process transactions to get capital gains data
  const capitalGainsTransactions = useMemo(() => {
    // Filter for sell transactions in the selected year
    const sellTransactions = transactions.filter(tx => 
      tx.type === 'sell' && 
      tx.date.startsWith(year)
    );
    
    // Convert to capital gains format
    return sellTransactions.map(sellTx => {
      const matchingBuyTx = findMatchingBuyTransaction(
        transactions, 
        sellTx,
        settings.costBasisMethod
      );
      
      const daysHeld = matchingBuyTx 
        ? calculateHoldingDays(matchingBuyTx.date, sellTx.date) 
        : 0;
      
      // Calculate gain
      const costBasis = sellTx.bitcoinAmount * (matchingBuyTx ? matchingBuyTx.pricePerBitcoin : sellTx.pricePerBitcoin);
      const proceeds = sellTx.fiatAmount;
      // Apply fees based on settings
      const fees = settings.includeFees ? (sellTx.fees || 0) : 0;
      const gain = proceeds - costBasis - fees;
      
      return {
        id: sellTx.id,
        date: sellTx.date,
        bitcoinAmount: sellTx.bitcoinAmount,
        costBasis: costBasis,
        proceeds: proceeds,
        gain: gain,
        holdingPeriod: daysHeld > 365 ? "long" : "short",
        daysHeld: daysHeld,
        originalTransaction: sellTx
      } as CapitalGainTransaction;
    });
  }, [transactions, year, settings]);
  
  // Filter the transactions
  const filteredTransactions = useMemo(() => {
    return capitalGainsTransactions.filter(tx => {
      if (filterBy === "all") return true;
      return tx.holdingPeriod === filterBy;
    });
  }, [capitalGainsTransactions, filterBy]);
  
  // Sort the transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortBy === "date") {
        return sortDirection === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "gain") {
        return sortDirection === "asc" ? a.gain - b.gain : b.gain - a.gain;
      } else if (sortBy === "daysHeld") {
        return sortDirection === "asc" ? a.daysHeld - b.daysHeld : b.daysHeld - a.daysHeld;
      }
      return 0;
    });
  }, [filteredTransactions, sortBy, sortDirection]);
  
  // Helper function to toggle sorting
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };
  
  // Calculate totals
  const totalGain = sortedTransactions.reduce((sum, tx) => sum + tx.gain, 0);
  const totalCostBasis = sortedTransactions.reduce((sum, tx) => sum + tx.costBasis, 0);
  const totalProceeds = sortedTransactions.reduce((sum, tx) => sum + tx.proceeds, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Capital Gains Report for {year}</h2>
          <p className="text-sm text-muted-foreground">
            Using {settings.costBasisMethod.toUpperCase()} cost basis method
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="short">Short-term Only</SelectItem>
              <SelectItem value="long">Long-term Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Cost Basis</span>
              <span className="text-lg font-bold">${totalCostBasis.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Proceeds</span>
              <span className="text-lg font-bold">${totalProceeds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Gain/Loss</span>
              <span className={`text-lg font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("date")}
                  className="flex items-center"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Amount (BTC)</TableHead>
              <TableHead>Cost Basis</TableHead>
              <TableHead>Proceeds</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("gain")}
                  className="flex items-center"
                >
                  Gain/Loss
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Holding Period</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("daysHeld")}
                  className="flex items-center"
                >
                  Days Held
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>₿ {tx.bitcoinAmount.toFixed(8)}</TableCell>
                  <TableCell>${tx.costBasis.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>${tx.proceeds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className={tx.gain >= 0 ? "text-green-500" : "text-red-500"}>
                    {tx.gain >= 0 ? "+" : ""}${tx.gain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.holdingPeriod === "short" 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}>
                      {tx.holdingPeriod === "short" ? "Short-term" : "Long-term"}
                    </span>
                  </TableCell>
                  <TableCell>{tx.daysHeld} days</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No realized gains or losses found for {year}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Format date string to MM/DD/YYYY
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
} 