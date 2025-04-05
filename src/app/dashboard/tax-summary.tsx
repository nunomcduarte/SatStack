"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Cell, Pie, PieChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface TaxSummaryProps {
  year: string
}

export default function TaxSummary({ year }: TaxSummaryProps) {
  // Mock data for tax summary
  const taxData = {
    totalGains: 8450,
    shortTermGains: 3200,
    longTermGains: 5250,
    estimatedTax: 1267.5,
    taxRate: 15
  }
  
  const pieData = [
    { name: 'Short-term', value: taxData.shortTermGains, color: "hsl(var(--chart-1))" },
    { name: 'Long-term', value: taxData.longTermGains, color: "hsl(var(--chart-3))" },
  ]
  
  const monthlyGains = [
    { month: 'Jan', gains: 0 },
    { month: 'Feb', gains: 450 },
    { month: 'Mar', gains: 0 },
    { month: 'Apr', gains: 1200 },
    { month: 'May', gains: 800 },
    { month: 'Jun', gains: 0 },
    { month: 'Jul', gains: 0 },
    { month: 'Aug', gains: 2500 },
    { month: 'Sep', gains: 1300 },
    { month: 'Oct', gains: 0 },
    { month: 'Nov', gains: 2200 },
    { month: 'Dec', gains: 0 },
  ]
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gains ({year})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxData.totalGains.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Short-term Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxData.shortTermGains.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Taxed as ordinary income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Long-term Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxData.longTermGains.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Taxed at {taxData.taxRate}%</p>
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
            <ChartContainer
              config={{
                short: {
                  label: "Short-term",
                  color: "hsl(var(--chart-1))",
                },
                long: {
                  label: "Long-term",
                  color: "hsl(var(--chart-3))",
                },
              }}
            >
              <PieChart width={200} height={200}>
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
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Estimation</CardTitle>
            <CardDescription>Based on your {year} realized gains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <p className="text-3xl font-bold mb-4">${taxData.estimatedTax.toLocaleString()}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Short-term taxes (est.):</span>
                  <span className="text-sm font-medium">${(taxData.shortTermGains * 0.24).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Long-term taxes (est.):</span>
                  <span className="text-sm font-medium">${(taxData.longTermGains * 0.15).toFixed(2)}</span>
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
          <ChartContainer
            config={{
              gains: {
                label: "Realized Gains",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-60"
          >
            <BarChart data={monthlyGains} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="gains" 
                name="Realized Gains"
                fill="var(--color-gains)" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
} 