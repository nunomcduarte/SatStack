"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TaxSummaryProps {
  year: string
}

export default function TaxSummary({ year }: TaxSummaryProps) {
  // Mock data for tax summary
  const mockData = {
    totalGains: 8450,
    shortTermGains: 3200,
    longTermGains: 5250,
    estimatedTax: 1267.5,
    taxRate: 15
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gains ({year})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.totalGains.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Short-term Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.shortTermGains.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Taxed as ordinary income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Long-term Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.longTermGains.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Taxed at {mockData.taxRate}%</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tax Estimation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Based on your {year} gains, your estimated tax is:</p>
          <p className="text-3xl font-bold mt-2">${mockData.estimatedTax.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-2">
            This is an estimate only. Please consult with a tax professional for accurate tax calculations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 