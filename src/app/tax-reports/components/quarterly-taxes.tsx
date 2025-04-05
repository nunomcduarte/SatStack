"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, DownloadIcon, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

interface QuarterlyTaxesProps {
  year: string;
  totalTax: number;
}

export default function QuarterlyTaxes({ year, totalTax }: QuarterlyTaxesProps) {
  // Calculate quarterly estimates (simple distribution for now)
  const quarterlyEstimates = useMemo(() => {
    // Split the total tax into quarters
    const quarterAmount = totalTax / 4;
    
    // Adjust for the current date (only pay for past quarters)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const selectedYear = parseInt(year);
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    
    // Get due dates for the year
    const q1DueDate = `April 15, ${year}`;
    const q2DueDate = `June 15, ${year}`;
    const q3DueDate = `September 15, ${year}`;
    const q4DueDate = `January 15, ${Number(year) + 1}`;
    
    // Determine which quarters are in the past, adjusting for tax year
    const isPastQuarter = (quarter) => {
      if (selectedYear < currentYear) return true;
      if (selectedYear > currentYear) return false;
      return quarter <= currentQuarter;
    };
    
    return [
      {
        id: "q1",
        quarter: "Q1",
        date: `January 1 - March 31, ${year}`,
        dueDate: q1DueDate,
        estimatedTax: quarterAmount,
        isPaid: isPastQuarter(1),
        paidAmount: isPastQuarter(1) ? quarterAmount : 0,
        paidDate: isPastQuarter(1) ? `April 12, ${year}` : null
      },
      {
        id: "q2",
        quarter: "Q2",
        date: `April 1 - June 30, ${year}`,
        dueDate: q2DueDate,
        estimatedTax: quarterAmount,
        isPaid: isPastQuarter(2),
        paidAmount: isPastQuarter(2) ? quarterAmount : 0,
        paidDate: isPastQuarter(2) ? `June 10, ${year}` : null
      },
      {
        id: "q3",
        quarter: "Q3",
        date: `July 1 - September 30, ${year}`,
        dueDate: q3DueDate,
        estimatedTax: quarterAmount,
        isPaid: isPastQuarter(3),
        paidAmount: isPastQuarter(3) ? quarterAmount : 0,
        paidDate: isPastQuarter(3) ? `September 10, ${year}` : null
      },
      {
        id: "q4",
        quarter: "Q4",
        date: `October 1 - December 31, ${year}`,
        dueDate: q4DueDate,
        estimatedTax: quarterAmount,
        isPaid: isPastQuarter(4),
        paidAmount: isPastQuarter(4) ? quarterAmount : 0,
        paidDate: isPastQuarter(4) ? `January 10, ${Number(year) + 1}` : null
      }
    ];
  }, [year, totalTax]);
  
  // Calculate totals
  const totalEstimated = quarterlyEstimates.reduce((sum, q) => sum + q.estimatedTax, 0);
  const totalPaid = quarterlyEstimates.reduce((sum, q) => sum + q.paidAmount, 0);
  const percentPaid = totalEstimated > 0 ? (totalPaid / totalEstimated) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quarterly Tax Estimates for {year}</h2>
        <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download Estimates
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Payment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Total estimated</span>
                <div className="text-2xl font-bold">${totalEstimated.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Paid to date</span>
                <div className="text-2xl font-bold text-green-500">${totalPaid.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment progress</span>
                <span>{percentPaid.toFixed(0)}%</span>
              </div>
              <Progress value={percentPaid} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        {quarterlyEstimates.map(quarter => (
          <Card key={quarter.id} className={quarter.isPaid ? "border-green-200 dark:border-green-900" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center mr-2">
                    {quarter.quarter}
                  </div>
                  {quarter.date}
                </CardTitle>
                {quarter.isPaid && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    Due date
                  </span>
                  <div className="font-medium">{quarter.dueDate}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estimated tax</span>
                  <div className="font-medium">${quarter.estimatedTax.toFixed(2)}</div>
                </div>
              </div>
              
              {quarter.isPaid ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Paid on</span>
                    <div className="font-medium">{quarter.paidDate}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Paid amount</span>
                    <div className="font-medium text-green-500">${quarter.paidAmount.toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Mark as Paid
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <InfoIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <CardTitle>Quarterly Tax Payment Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>
            If you have income that isn't subject to withholding (like cryptocurrency gains), you may need to make quarterly estimated tax payments.
          </p>
          <p>
            The U.S. tax system operates on a "pay-as-you-go" basis, and the IRS may charge penalties if you don't pay enough through withholding or estimated tax payments.
          </p>
          <p>
            These estimates are based on your current transaction history and may change as you add new transactions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 