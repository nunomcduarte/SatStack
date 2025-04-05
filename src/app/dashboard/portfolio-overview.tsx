"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useTransactionsStore } from "@/lib/stores/transactionsStore"

// Sample demo data (will be used if no transactions exist)
const samplePortfolioData = [
  { date: "Jan", value: 0, btc: 0 },
  { date: "Feb", value: 0, btc: 0 },
  { date: "Mar", value: 0, btc: 0 },
  { date: "Apr", value: 0, btc: 0 },
  { date: "May", value: 0, btc: 0 },
  { date: "Jun", value: 0, btc: 0 },
  { date: "Jul", value: 0, btc: 0 },
  { date: "Aug", value: 0, btc: 0 },
  { date: "Sep", value: 0, btc: 0 },
  { date: "Oct", value: 0, btc: 0 },
  { date: "Nov", value: 0, btc: 0 },
  { date: "Dec", value: 0, btc: 0 },
]

const sampleCostBasisData = [
  { date: "Jan", price: 0 },
  { date: "Feb", price: 0 },
  { date: "Mar", price: 0 },
  { date: "Apr", price: 0 },
  { date: "May", price: 0 },
  { date: "Jun", price: 0 },
  { date: "Jul", price: 0 },
  { date: "Aug", price: 0 },
  { date: "Sep", price: 0 },
  { date: "Oct", price: 0 },
  { date: "Nov", price: 0 },
  { date: "Dec", price: 0 },
]

const sampleHoldingPeriodData = [
  { period: "< 1 month", amount: 0 },
  { period: "1-3 months", amount: 0 },
  { period: "3-6 months", amount: 0 },
  { period: "6-12 months", amount: 0 },
  { period: "> 12 months", amount: 0 },
]

interface PortfolioOverviewProps {
  timeframe?: string;
}

export default function PortfolioOverview({ timeframe = "all" }: PortfolioOverviewProps) {
  const { transactions } = useTransactionsStore();
  
  // Process transactions into chart data based on timeframe
  const { portfolioData, costBasisData, holdingPeriodData } = useMemo(() => {
    // If no transactions, use sample data
    if (!transactions || transactions.length === 0) {
      return { 
        portfolioData: samplePortfolioData, 
        costBasisData: sampleCostBasisData, 
        holdingPeriodData: sampleHoldingPeriodData 
      };
    }
    
    // Filter transactions based on timeframe
    const now = new Date();
    const filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      if (timeframe === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return txDate >= weekAgo;
      } else if (timeframe === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return txDate >= monthAgo;
      } else if (timeframe === "year") {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return txDate >= yearAgo;
      }
      return true; // "all" timeframe
    });
    
    // Process filtered transactions into portfolio data
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentPrice = 60500;
    
    // For "all" timeframe, show year-over-year data instead of monthly
    if (timeframe === "all" && sortedTransactions.length > 0) {
      // Find the range of years in the transactions
      const years = sortedTransactions.reduce((acc, tx) => {
        const year = new Date(tx.date).getFullYear();
        if (!acc.includes(year)) acc.push(year);
        return acc;
      }, [] as number[]).sort();
      
      // If we have no years (shouldn't happen), default to current year
      if (years.length === 0) {
        years.push(now.getFullYear());
      }
      
      // Ensure we include the current year even if no transactions yet
      if (!years.includes(now.getFullYear())) {
        years.push(now.getFullYear());
      }
      
      // Generate yearly portfolio data
      const portfolioByYear = years.map(year => {
        // Calculate cumulative BTC up to the end of this year
        let cumulativeBtc = 0;
        
        sortedTransactions.forEach(tx => {
          const txDate = new Date(tx.date);
          if (txDate.getFullYear() <= year) {
            if (tx.type === 'buy' || tx.type === 'receive') {
              cumulativeBtc += tx.bitcoinAmount;
            } else if (tx.type === 'sell' || tx.type === 'send' || tx.type === 'spend') {
              cumulativeBtc -= tx.bitcoinAmount;
            }
          }
        });
        
        return {
          date: year.toString(),
          btc: parseFloat(cumulativeBtc.toFixed(2)),
          value: parseFloat((cumulativeBtc * currentPrice).toFixed(2))
        };
      });
      
      // Calculate yearly cost basis
      const costBasisByYear = years.map(year => {
        // Calculate average cost basis up to this year
        let totalBtcBought = 0;
        let totalSpent = 0;
        
        sortedTransactions.forEach(tx => {
          const txDate = new Date(tx.date);
          if (txDate.getFullYear() <= year && tx.type === 'buy') {
            totalBtcBought += tx.bitcoinAmount;
            totalSpent += tx.fiatAmount;
          }
        });
        
        const avgCostBasis = totalBtcBought > 0 ? totalSpent / totalBtcBought : 0;
        
        return {
          date: year.toString(),
          price: parseFloat(avgCostBasis.toFixed(2))
        };
      });
      
      // For holding periods in the "all" timeframe, we'll use the same calculation
      // but make sure to consider all transactions
      const now_ms = now.getTime();
      const holdingPeriods = [
        { period: "< 1 month", amount: 0 },
        { period: "1-3 months", amount: 0 },
        { period: "3-6 months", amount: 0 },
        { period: "6-12 months", amount: 0 },
        { period: "> 12 months", amount: 0 },
      ];
      
      // Track bitcoin that hasn't been sold yet
      const activeBitcoin = new Map<string, {amount: number, date: Date}>();
      let idCounter = 0;
      
      // Process buy/receive transactions first
      sortedTransactions.forEach(tx => {
        if (tx.type === 'buy' || tx.type === 'receive') {
          activeBitcoin.set(`${tx.id || idCounter++}`, {
            amount: tx.bitcoinAmount,
            date: new Date(tx.date)
          });
        }
      });
      
      // Process sell/send transactions using FIFO
      sortedTransactions.forEach(tx => {
        if (tx.type === 'sell' || tx.type === 'send' || tx.type === 'spend') {
          let remainingToSell = tx.bitcoinAmount;
          
          // Sort the active bitcoin by date (oldest first for FIFO)
          const sortedBitcoin = Array.from(activeBitcoin.entries())
            .sort((a, b) => a[1].date.getTime() - b[1].date.getTime());
          
          for (const [id, bitcoinEntry] of sortedBitcoin) {
            if (remainingToSell <= 0) break;
            
            const amountToSell = Math.min(remainingToSell, bitcoinEntry.amount);
            remainingToSell -= amountToSell;
            
            // Update or remove this entry
            if (amountToSell < bitcoinEntry.amount) {
              activeBitcoin.set(id, {
                amount: bitcoinEntry.amount - amountToSell,
                date: bitcoinEntry.date
              });
            } else {
              activeBitcoin.delete(id);
            }
          }
        }
      });
      
      // Calculate holding periods for remaining bitcoin
      for (const bitcoinEntry of Array.from(activeBitcoin.values())) {
        const ageInMonths = (now_ms - bitcoinEntry.date.getTime()) / (30 * 24 * 60 * 60 * 1000);
        
        if (ageInMonths < 1) {
          holdingPeriods[0].amount += bitcoinEntry.amount;
        } else if (ageInMonths < 3) {
          holdingPeriods[1].amount += bitcoinEntry.amount;
        } else if (ageInMonths < 6) {
          holdingPeriods[2].amount += bitcoinEntry.amount;
        } else if (ageInMonths < 12) {
          holdingPeriods[3].amount += bitcoinEntry.amount;
        } else {
          holdingPeriods[4].amount += bitcoinEntry.amount;
        }
      }
      
      // Round the amounts
      holdingPeriods.forEach(period => {
        period.amount = parseFloat(period.amount.toFixed(2));
      });
      
      return {
        portfolioData: portfolioByYear,
        costBasisData: costBasisByYear,
        holdingPeriodData: holdingPeriods
      };
    }
    
    // Generate monthly portfolio data (for non-"all" timeframes)
    const portfolio = months.map((month, idx) => {
      // Calculate cumulative BTC up to this month
      let cumulativeBtc = 0;
      const monthIndex = idx;
      
      sortedTransactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() <= monthIndex) {
          if (tx.type === 'buy' || tx.type === 'receive') {
            cumulativeBtc += tx.bitcoinAmount;
          } else if (tx.type === 'sell' || tx.type === 'send' || tx.type === 'spend') {
            cumulativeBtc -= tx.bitcoinAmount;
          }
        }
      });
      
      return {
        date: month,
        btc: parseFloat(cumulativeBtc.toFixed(2)),
        value: parseFloat((cumulativeBtc * currentPrice).toFixed(2))
      };
    });
    
    // Calculate monthly cost basis
    const costBasis = months.map((month, idx) => {
      // Calculate average cost basis up to this month
      let totalBtcBought = 0;
      let totalSpent = 0;
      const monthIndex = idx;
      
      sortedTransactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() <= monthIndex && tx.type === 'buy') {
          totalBtcBought += tx.bitcoinAmount;
          totalSpent += tx.fiatAmount;
        }
      });
      
      const avgCostBasis = totalBtcBought > 0 ? totalSpent / totalBtcBought : 0;
      
      return {
        date: month,
        price: parseFloat(avgCostBasis.toFixed(2))
      };
    });
    
    // Calculate holding period distribution
    const now_ms = now.getTime();
    const holdingPeriods = [
      { period: "< 1 month", amount: 0 },
      { period: "1-3 months", amount: 0 },
      { period: "3-6 months", amount: 0 },
      { period: "6-12 months", amount: 0 },
      { period: "> 12 months", amount: 0 },
    ];
    
    // Track bitcoin that hasn't been sold yet
    const activeBitcoin = new Map<string, {amount: number, date: Date}>();
    let idCounter = 0;
    
    // Process buy/receive transactions first
    sortedTransactions.forEach(tx => {
      if (tx.type === 'buy' || tx.type === 'receive') {
        activeBitcoin.set(`${tx.id || idCounter++}`, {
          amount: tx.bitcoinAmount,
          date: new Date(tx.date)
        });
      }
    });
    
    // Process sell/send transactions using FIFO
    sortedTransactions.forEach(tx => {
      if (tx.type === 'sell' || tx.type === 'send' || tx.type === 'spend') {
        let remainingToSell = tx.bitcoinAmount;
        
        // Sort the active bitcoin by date (oldest first for FIFO)
        const sortedBitcoin = Array.from(activeBitcoin.entries())
          .sort((a, b) => a[1].date.getTime() - b[1].date.getTime());
        
        for (const [id, bitcoinEntry] of sortedBitcoin) {
          if (remainingToSell <= 0) break;
          
          const amountToSell = Math.min(remainingToSell, bitcoinEntry.amount);
          remainingToSell -= amountToSell;
          
          // Update or remove this entry
          if (amountToSell < bitcoinEntry.amount) {
            activeBitcoin.set(id, {
              amount: bitcoinEntry.amount - amountToSell,
              date: bitcoinEntry.date
            });
          } else {
            activeBitcoin.delete(id);
          }
        }
      }
    });
    
    // Calculate holding periods for remaining bitcoin
    for (const bitcoinEntry of Array.from(activeBitcoin.values())) {
      const ageInMonths = (now_ms - bitcoinEntry.date.getTime()) / (30 * 24 * 60 * 60 * 1000);
      
      if (ageInMonths < 1) {
        holdingPeriods[0].amount += bitcoinEntry.amount;
      } else if (ageInMonths < 3) {
        holdingPeriods[1].amount += bitcoinEntry.amount;
      } else if (ageInMonths < 6) {
        holdingPeriods[2].amount += bitcoinEntry.amount;
      } else if (ageInMonths < 12) {
        holdingPeriods[3].amount += bitcoinEntry.amount;
      } else {
        holdingPeriods[4].amount += bitcoinEntry.amount;
      }
    }
    
    // Round the amounts
    holdingPeriods.forEach(period => {
      period.amount = parseFloat(period.amount.toFixed(2));
    });
    
    return { 
      portfolioData: portfolio, 
      costBasisData: costBasis, 
      holdingPeriodData: holdingPeriods 
    };
  }, [transactions, timeframe]);
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
          <CardDescription>
            {timeframe === "all" 
              ? "Year-over-year value of your Bitcoin holdings"
              : "Total value of your Bitcoin holdings in USD"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Portfolio Value (USD)",
                color: "hsl(215, 100%, 60%)",
              },
              btc: {
                label: "BTC Amount",
                color: "hsl(35, 100%, 60%)",
              },
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(215, 100%, 60%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(215, 100%, 60%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="value"
                  name="Portfolio Value"
                  stroke="hsl(215, 100%, 60%)"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="btc" 
                  name="BTC Amount"
                  stroke="hsl(35, 100%, 60%)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Cost Basis</CardTitle>
          <CardDescription>
            {timeframe === "all" 
              ? "Your average cost per Bitcoin by year"
              : "Your average cost per Bitcoin over time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              price: {
                label: "Cost Basis (USD)",
                color: "hsl(150, 100%, 45%)",
              },
            }}
            className="h-60"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costBasisData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  name="Cost Basis"
                  stroke="hsl(150, 100%, 45%)" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holding Period Distribution</CardTitle>
          <CardDescription>Bitcoin amounts by holding duration</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              amount: {
                label: "BTC Amount",
                color: "hsl(280, 100%, 65%)",
              },
            }}
            className="h-60"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={holdingPeriodData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="amount" 
                  name="BTC"
                  fill="hsl(280, 100%, 65%)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
} 