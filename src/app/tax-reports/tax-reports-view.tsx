"use client"

import { useState, useEffect } from "react"
import { DownloadIcon, InfoIcon, PrinterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import AnnualSummary from "./components/annual-summary"
import CapitalGainsReport from "./components/capital-gains-report"
import TaxSettings from "./components/tax-settings"
import { useTransactionsStore } from "@/lib/stores/transactionsStore"
import { getCurrentPrice } from "@/lib/services/priceService"
import { useTaxSettings } from "@/lib/contexts/taxSettingsContext"
import { Transaction } from "@/lib/stores/transactionsStore"

// Capital gains tax calculation functions
function calculateTotalRealizedGains(
  transactions: Transaction[], 
  year: string, 
  costBasisMethod: string,
  includeFees: boolean
): { total: number; shortTerm: number; longTerm: number } {
  if (!transactions || transactions.length === 0) {
    return { total: 0, shortTerm: 0, longTerm: 0 };
  }
  
  let shortTermGains = 0;
  let longTermGains = 0;
  
  // Filter transactions for the selected year
  const yearTransactions = transactions.filter(tx => 
    tx.date && tx.date.startsWith(year) && tx.type === 'sell'
  );
  
  yearTransactions.forEach(tx => {
    // Calculate holding period in days
    const purchaseDate = findPurchaseDate(transactions, tx, costBasisMethod);
    if (!purchaseDate) return;
    
    const sellDate = new Date(tx.date);
    const holdingDays = Math.floor((sellDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const isLongTerm = holdingDays > 365;
    
    // Calculate gain for this transaction based on the selected cost basis method
    const costBasis = tx.bitcoinAmount * findAverageCostBasis(transactions, tx, costBasisMethod);
    const proceeds = tx.fiatAmount;
    // Apply fees based on settings
    const fees = includeFees ? (tx.fees || 0) : 0;
    const gain = proceeds - costBasis - fees;
    
    if (isLongTerm) {
      longTermGains += gain;
    } else {
      shortTermGains += gain;
    }
  });
  
  return {
    total: shortTermGains + longTermGains,
    shortTerm: shortTermGains,
    longTerm: longTermGains
  };
}

// Find the matching "buy" transaction for a "sell" transaction based on the cost basis method
function findPurchaseDate(
  transactions: Transaction[], 
  sellTransaction: Transaction,
  costBasisMethod: string
): Date | null {
  // Sort buy transactions based on the selected method
  const buyTransactions = transactions.filter(tx => tx.type === 'buy');
  
  if (buyTransactions.length === 0) return null;
  
  let sortedBuyTransactions;
  
  switch (costBasisMethod) {
    case 'fifo': // First In, First Out - oldest first
      sortedBuyTransactions = buyTransactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      break;
    case 'lifo': // Last In, First Out - newest first
      sortedBuyTransactions = buyTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      break;
    case 'hifo': // Highest In, First Out - highest cost first
      sortedBuyTransactions = buyTransactions.sort(
        (a, b) => b.pricePerBitcoin - a.pricePerBitcoin
      );
      break;
    default:
      sortedBuyTransactions = buyTransactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }
  
  // Return the date of the first buy transaction based on the sorting method
  return sortedBuyTransactions.length > 0 ? new Date(sortedBuyTransactions[0].date) : null;
}

// Calculate average cost basis for Bitcoin at the time of a transaction
function findAverageCostBasis(
  transactions: Transaction[], 
  targetTx: Transaction,
  costBasisMethod: string
): number {
  const date = new Date(targetTx.date);
  
  // Filter buy transactions that happened before this sell
  const previousBuys = transactions.filter(tx => 
    tx.type === 'buy' && new Date(tx.date) < date
  );
  
  if (previousBuys.length === 0) return targetTx.pricePerBitcoin;
  
  // For HIFO and LIFO, use the specific matched transaction's price
  if (costBasisMethod === 'hifo' || costBasisMethod === 'lifo') {
    let sortedBuys;
    
    if (costBasisMethod === 'hifo') {
      // Sort by highest price
      sortedBuys = previousBuys.sort((a, b) => b.pricePerBitcoin - a.pricePerBitcoin);
    } else {
      // Sort by latest date
      sortedBuys = previousBuys.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    
    return sortedBuys[0].pricePerBitcoin;
  }
  
  // For FIFO or default, calculate the average cost basis
  const totalBtc = previousBuys.reduce((sum, tx) => sum + tx.bitcoinAmount, 0);
  const totalCost = previousBuys.reduce((sum, tx) => sum + tx.fiatAmount, 0);
  
  return totalBtc > 0 ? totalCost / totalBtc : targetTx.pricePerBitcoin;
}

// Calculate tax estimate based on gains and tax rates
function calculateTaxEstimate(
  gains: { total: number; shortTerm: number; longTerm: number },
  shortTermRate: number,
  longTermRate: number
): number {
  // No tax if there are no gains or losses
  if (gains.total <= 0) return 0;
  
  // Calculate tax for each type of gain
  const shortTermTax = gains.shortTerm > 0 ? gains.shortTerm * (shortTermRate / 100) : 0;
  const longTermTax = gains.longTerm > 0 ? gains.longTerm * (longTermRate / 100) : 0;
  
  return shortTermTax + longTermTax;
}

export default function TaxReportsView() {
  const [selectedYear, setSelectedYear] = useState("2023")
  const currentYear = new Date().getFullYear()
  const { transactions } = useTransactionsStore()
  const { settings } = useTaxSettings()
  const [currentBtcPrice, setCurrentBtcPrice] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Generate year options (current year and 5 years back)
  const yearOptions = []
  for (let i = 0; i < 6; i++) {
    yearOptions.push((currentYear - i).toString())
  }
  
  // Calculate gains for the selected year using tax settings
  const gainsByYear = calculateTotalRealizedGains(
    transactions, 
    selectedYear,
    settings.costBasisMethod,
    settings.includeFees
  );
  
  // Calculate tax estimate using the tax rates from settings
  const taxEstimate = calculateTaxEstimate(
    gainsByYear,
    settings.shortTermRate,
    settings.longTermRate
  );
  
  // Calculate percentages
  const shortTermPercent = gainsByYear.total > 0 
    ? Math.round((gainsByYear.shortTerm / gainsByYear.total) * 100) 
    : 0;
  
  const longTermPercent = gainsByYear.total > 0 
    ? Math.round((gainsByYear.longTerm / gainsByYear.total) * 100)
    : 0;
  
  // Get current Bitcoin price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getCurrentPrice();
        setCurrentBtcPrice(price);
      } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
        setCurrentBtcPrice(65000); // Fallback price
      }
    };
    
    fetchPrice();
  }, []);
  
  // Listen for transaction updates and tax settings changes
  useEffect(() => {
    const handleTransactionUpdate = () => {
      setRefreshKey(prevKey => prevKey + 1);
    };
    
    const handleTaxSettingsUpdate = () => {
      setRefreshKey(prevKey => prevKey + 1);
    };
    
    window.addEventListener('transaction-added', handleTransactionUpdate);
    window.addEventListener('tax-settings-updated', handleTaxSettingsUpdate);
    
    return () => {
      window.removeEventListener('transaction-added', handleTransactionUpdate);
      window.removeEventListener('tax-settings-updated', handleTaxSettingsUpdate);
    };
  }, []);
  
  return (
    <div className="w-full">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Tax Reports</h1>
          <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Realized Gains
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="ml-1 h-3 w-3 inline-block text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Total capital gains from Bitcoin sales in {selectedYear}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${gainsByYear.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-sm text-muted-foreground">For tax year {selectedYear}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Short-term Gains
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="ml-1 h-3 w-3 inline-block text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Gains from assets held for less than one year</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${gainsByYear.shortTerm.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-sm text-muted-foreground">{shortTermPercent}% of total gains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Long-term Gains
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="ml-1 h-3 w-3 inline-block text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Gains from assets held for more than one year</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${gainsByYear.longTerm.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-sm text-muted-foreground">{longTermPercent}% of total gains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estimated Tax
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="ml-1 h-3 w-3 inline-block text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Estimated tax based on your tax rate settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${taxEstimate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-sm text-muted-foreground">
                {gainsByYear.total <= 0 
                  ? 'No taxable gains' 
                  : `${settings.shortTermRate}% ST / ${settings.longTermRate}% LT`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Annual Summary</TabsTrigger>
            <TabsTrigger value="capital-gains">Capital Gains</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <AnnualSummary 
              key={`summary-${refreshKey}`}
              year={selectedYear} 
              gains={gainsByYear} 
              taxEstimate={taxEstimate} 
            />
          </TabsContent>

          <TabsContent value="capital-gains" className="space-y-4">
            <CapitalGainsReport 
              key={`capital-gains-${refreshKey}`}
              year={selectedYear}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <TaxSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 