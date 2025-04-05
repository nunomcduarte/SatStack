"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

const portfolioData = [
  { date: "Jan", value: 35000, btc: 1.2 },
  { date: "Feb", value: 42000, btc: 1.5 },
  { date: "Mar", value: 38000, btc: 1.5 },
  { date: "Apr", value: 45000, btc: 1.7 },
  { date: "May", value: 55000, btc: 1.9 },
  { date: "Jun", value: 68000, btc: 2.1 },
  { date: "Jul", value: 72000, btc: 2.2 },
  { date: "Aug", value: 80000, btc: 2.3 },
  { date: "Sep", value: 95000, btc: 2.35 },
  { date: "Oct", value: 110000, btc: 2.35 },
  { date: "Nov", value: 125000, btc: 2.35 },
  { date: "Dec", value: 142350, btc: 2.35 },
]

const costBasisData = [
  { date: "Jan", price: 29166 },
  { date: "Feb", price: 28000 },
  { date: "Mar", price: 25333 },
  { date: "Apr", price: 26470 },
  { date: "May", price: 28947 },
  { date: "Jun", price: 32380 },
  { date: "Jul", price: 32727 },
  { date: "Aug", price: 34782 },
  { date: "Sep", price: 40425 },
  { date: "Oct", price: 46808 },
  { date: "Nov", price: 53191 },
  { date: "Dec", price: 60574 },
]

const holdingPeriodData = [
  { period: "< 1 month", amount: 0.2 },
  { period: "1-3 months", amount: 0.35 },
  { period: "3-6 months", amount: 0.5 },
  { period: "6-12 months", amount: 0.8 },
  { period: "> 12 months", amount: 0.5 },
]

export default function PortfolioOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
          <CardDescription>Total value of your Bitcoin holdings in USD</CardDescription>
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
          <CardDescription>Your average cost per Bitcoin over time</CardDescription>
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