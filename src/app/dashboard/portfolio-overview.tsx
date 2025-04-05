"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PortfolioValueChart from '@/components/portfolio/PortfolioValueChart'
import AverageCostBasisChart from '@/components/portfolio/AverageCostBasisChart'
import HoldingPeriodChart from '@/components/portfolio/HoldingPeriodChart'

export default function PortfolioOverview() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <PortfolioValueChart />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Average Cost Basis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <AverageCostBasisChart />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Holding Period Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <HoldingPeriodChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 