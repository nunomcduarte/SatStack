"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTransactionsStore } from "@/lib/stores/transactionsStore"
import { useState } from "react"

interface AnnualSummaryProps {
  year: string;
  gains: {
    total: number;
    shortTerm: number;
    longTerm: number;
  };
  taxEstimate: number;
}

export default function AnnualSummary({ year, gains, taxEstimate }: AnnualSummaryProps) {
  // Calculate percentages with fallbacks for zero division
  const shortTermPercent = gains.total > 0 
    ? Math.round((gains.shortTerm / gains.total) * 100) 
    : 0;
  
  const longTermPercent = gains.total > 0 
    ? Math.round((gains.longTerm / gains.total) * 100)
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="col-span-1 bg-[#0D1117] dark:bg-[#0D1117] text-white">
        <CardHeader>
          <CardTitle className="text-xl">Total Realized Gains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">${gains.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <p className="text-sm text-gray-400">For tax year {year}</p>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Short-term gains</span>
              <span className="font-medium">${gains.shortTerm.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-[#1E293B] h-2 rounded-full">
              <div className="bg-[#4169E1] h-2 rounded-full" style={{ width: `${shortTermPercent}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm">Long-term gains</span>
              <span className="font-medium">${gains.longTerm.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-[#1E293B] h-2 rounded-full">
              <div className="bg-[#F7BE38] h-2 rounded-full" style={{ width: `${longTermPercent}%` }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 bg-[#040B14] dark:bg-[#040B14] text-white">
        <CardHeader>
          <CardTitle className="text-xl">Gains Distribution</CardTitle>
          <p className="text-sm text-gray-400">Short-term vs Long-term</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[calc(100%-5rem)]">
          {gains.total > 0 ? (
            <TooltipProvider>
              <div className="relative w-56 h-56">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Donut chart */}
                  <svg className="w-56 h-56" viewBox="0 0 100 100">
                    {/* Background circle for the donut chart */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#111827" 
                      strokeWidth="20" 
                    />
                    
                    {/* Long-term segment (yellow) - special handling for 100% case */}
                    {longTermPercent === 100 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent" 
                            stroke="#F7BE38" 
                            strokeWidth="20"
                            className="cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-sm font-medium">Long-term: 100%</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : longTermPercent > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent" 
                            stroke="#F7BE38" 
                            strokeWidth="20" 
                            strokeDasharray={`${longTermPercent * 2.51} 251`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                            className="cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-sm font-medium">Long-term: {longTermPercent}%</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    {/* Short-term segment (blue) */}
                    {shortTermPercent === 100 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent" 
                            stroke="#4169E1" 
                            strokeWidth="20"
                            className="cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-sm font-medium">Short-term: 100%</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : shortTermPercent > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent" 
                            stroke="#4169E1" 
                            strokeWidth="20" 
                            strokeDasharray={`${shortTermPercent * 2.51} 251`}
                            strokeDashoffset={`${251 - longTermPercent * 2.51}`}
                            transform="rotate(-90 50 50)"
                            className="cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-sm font-medium">Short-term: {shortTermPercent}%</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </svg>
                </div>
              </div>
            </TooltipProvider>
          ) : (
            <div className="text-center text-gray-400">
              No gain data to display
            </div>
          )}
          
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#4169E1] rounded-full mr-2"></div>
              <span className="text-sm">Short-term</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#F7BE38] rounded-full mr-2"></div>
              <span className="text-sm">Long-term</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 bg-[#0D1117] dark:bg-[#0D1117] text-white">
        <CardHeader>
          <CardTitle className="text-xl">Tax Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">${taxEstimate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <p className="text-sm text-gray-400">
            {gains.total > 0 ? `${Number(year) + 1} Tax Year` : 'No taxable gains'}
          </p>
          
          <div className="mt-6 space-y-4">
            {gains.total > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Total taxable gains</span>
                <span className="font-medium">${gains.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 