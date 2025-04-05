"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Cell, Pie, PieChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTransactionsStore } from "@/lib/stores/transactionsStore"

interface TaxSummaryProps {
  year: string
}

export default function TaxSummary({ year }: TaxSummaryProps) {
  const { transactions } = useTransactionsStore();
  
  // Calculate tax data from actual transactions
  const taxData = useMemo(() => {
    // Default values for demo if no transactions
    if (!transactions || transactions.length === 0) {
      return {
        totalGains: 0,
        shortTermGains: 0,
        longTermGains: 0,
        estimatedTax: 0,
        shortTermTax: 0,
        longTermTax: 0,
        taxRate: 0,
        monthlyGains: {}
      };
    }
    
    // Filter transactions for the selected year and 'sell' type
    const sellTransactions = transactions.filter(tx => {
      const isSellType = tx.type.toLowerCase() === 'sell';
      const txYear = tx.date.split('-')[0];
      const matchesYear = txYear === year;
      
      return isSellType && matchesYear;
    });
    
    // Calculate FIFO cost basis
    const calculateGainsFIFO = () => {
      // Get all buy transactions sorted by date
      const buyTransactions = [...transactions]
        .filter(tx => tx.type.toLowerCase() === 'buy')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (buyTransactions.length === 0 && sellTransactions.length === 0) {
        return { shortTerm: 0, longTerm: 0, monthlyGains: {} };
      }
      
      let shortTermGains = 0;
      let longTermGains = 0;
      const monthlyGains: Record<string, number> = {};
      
      // Initialize monthly gains with 0 for each month
      for (let i = 1; i <= 12; i++) {
        const monthName = new Date(0, i-1).toLocaleString('default', { month: 'short' });
        monthlyGains[monthName] = 0;
      }
      
      // Clone buy transactions to track remaining amounts
      const remainingBuys = buyTransactions.map(tx => ({ 
        ...tx, 
        remainingAmount: tx.bitcoinAmount 
      }));
      
      // Process each sell transaction using FIFO
      sellTransactions.forEach(sellTx => {
        const bitcoinAmount = sellTx.bitcoinAmount;
        const fiatAmount = sellTx.fiatAmount;
        
        let remainingToSell = bitcoinAmount;
        let sellProceeds = fiatAmount;
        let costBasis = 0;
        const sellDate = new Date(sellTx.date);
        const sellMonth = sellDate.toLocaleString('default', { month: 'short' });
        
        // Use FIFO to match buys with this sell
        for (let i = 0; i < remainingBuys.length && remainingToSell > 0; i++) {
          const buyTx = remainingBuys[i];
          const buyAmount = buyTx.bitcoinAmount;
          const buyFiatAmount = buyTx.fiatAmount;
          
          if (buyTx.remainingAmount <= 0) continue;
          
          // Calculate how much BTC to use from this buy
          const btcUsed = Math.min(buyTx.remainingAmount, remainingToSell);
          
          // Calculate portion of original cost
          const portionOfCost = (btcUsed / buyAmount) * buyFiatAmount;
          costBasis += portionOfCost;
          
          // Calculate portion of sell proceeds
          const portionOfProceeds = (btcUsed / bitcoinAmount) * sellProceeds;
          
          // Determine if gain is short or long term
          const buyDate = new Date(buyTx.date);
          const holdingPeriod = (sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24);
          const isLongTerm = holdingPeriod >= 365;
          
          // Calculate gain and add to appropriate category
          const gain = portionOfProceeds - portionOfCost;
          
          if (isLongTerm) {
            longTermGains += gain;
          } else {
            shortTermGains += gain;
          }
          
          // Add to monthly gains
          monthlyGains[sellMonth] = (monthlyGains[sellMonth] || 0) + gain;
          
          // Update remaining amounts
          buyTx.remainingAmount -= btcUsed;
          remainingToSell -= btcUsed;
        }
        
        // If there were no matching buys or not enough buys to cover the sell
        // This handles cases where we sell without any matching buy transactions
        if (remainingToSell > 0) {
          // Calculate the portion of proceeds for the remaining amount
          const remainingProceeds = (remainingToSell / bitcoinAmount) * sellProceeds;
          
          // Treat it as a short-term gain with zero cost basis
          shortTermGains += remainingProceeds;
          
          // Add to monthly gains
          monthlyGains[sellMonth] = (monthlyGains[sellMonth] || 0) + remainingProceeds;
        }
      });
      
      return { 
        shortTerm: shortTermGains, 
        longTerm: longTermGains,
        monthlyGains
      };
    };
    
    const gainsData = calculateGainsFIFO();
    
    // Update tax rates based on new requirements
    const shortTermTaxRate = 0.28; // 28% for short-term gains (less than 365 days)
    const longTermTaxRate = 0; // 0% for long-term gains (more than 365 days - tax free)
    
    const shortTermTax = Math.max(0, gainsData.shortTerm * shortTermTaxRate);
    const longTermTax = Math.max(0, gainsData.longTerm * longTermTaxRate);
    
    return {
      totalGains: gainsData.shortTerm + gainsData.longTerm,
      shortTermGains: gainsData.shortTerm,
      longTermGains: gainsData.longTerm,
      estimatedTax: shortTermTax + longTermTax,
      shortTermTax,
      longTermTax,
      taxRate: 0, // Long-term rate is 0%
      monthlyGains: gainsData.monthlyGains
    };
  }, [transactions, year]);
  
  // Prepare chart data
  const pieData = [
    { name: 'Short-term', value: Math.max(0, taxData.shortTermGains), color: "hsl(215, 100%, 60%)" },
    { name: 'Long-term', value: Math.max(0, taxData.longTermGains), color: "hsl(150, 100%, 45%)" },
  ].filter(item => item.value > 0); // Only include non-zero values
  
  const monthlyGainsData = Object.entries(taxData.monthlyGains || {}).map(([month, gains]) => ({
    month,
    gains: parseFloat(gains.toFixed(2))
  })).filter(item => item.gains !== 0) // Only include months with non-zero gains
  .sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });
  
  // Determine if there's any data to show in the distribution chart
  const hasDistributionData = pieData.length > 0 && pieData.some(item => item.value > 0);
  
  // Determine if there's any data to show in the monthly chart
  const hasMonthlyData = monthlyGainsData.length > 0 && monthlyGainsData.some(item => item.gains > 0);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gains ({year})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxData.totalGains.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Short-term Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxData.shortTermGains.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
            <p className="text-xs text-gray-400">Taxed at 28%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Long-term Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxData.longTermGains.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
            <p className="text-xs text-gray-400">Tax free</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gains Distribution</CardTitle>
            <CardDescription>Short-term vs Long-term capital gains</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-60">
            {hasDistributionData ? (
              <ChartContainer
                config={{
                  short: {
                    label: "Short-term",
                    color: "hsl(215, 100%, 60%)",
                  },
                  long: {
                    label: "Long-term",
                    color: "hsl(150, 100%, 45%)",
                  },
                }}
              >
                <ResponsiveContainer width={250} height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                No gains data available for {year}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Estimation</CardTitle>
            <CardDescription>Based on your {year} realized gains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <p className="text-3xl font-bold mb-4">${taxData.estimatedTax.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Short-term taxes (est.):</span>
                  <span className="text-sm font-medium">${taxData.shortTermTax.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Long-term taxes (est.):</span>
                  <span className="text-sm font-medium">${taxData.longTermTax.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                This is an estimate only. Please consult with a tax professional for accurate tax calculations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Realized Gains ({year})</CardTitle>
          <CardDescription>Distribution of gains throughout the year</CardDescription>
        </CardHeader>
        <CardContent>
          {hasMonthlyData ? (
            <ChartContainer
              config={{
                gains: {
                  label: "Realized Gains",
                  color: "hsl(280, 100%, 65%)",
                },
              }}
              className="h-60"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyGainsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="gains" 
                    name="Realized Gains"
                    fill="hsl(280, 100%, 65%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No monthly gains data available for {year}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 