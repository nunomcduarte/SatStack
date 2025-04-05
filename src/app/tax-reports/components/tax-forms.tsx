"use client"

import { DownloadIcon, FileIcon, InfoIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaxFormsProps {
  year: string
}

export default function TaxForms({ year }: TaxFormsProps) {
  const forms = [
    {
      id: "form8949",
      name: "Form 8949",
      description: "Sales and Other Dispositions of Capital Assets",
      info: "Required for reporting Bitcoin sales to the IRS",
      status: "ready"
    },
    {
      id: "scheduled",
      name: "Schedule D",
      description: "Capital Gains and Losses",
      info: "Summarizes all capital gains and losses",
      status: "ready"
    },
    {
      id: "form1040",
      name: "Form 1040",
      description: "U.S. Individual Income Tax Return",
      info: "Information for your main tax return",
      status: "ready"
    },
    {
      id: "fincen114",
      name: "FinCEN 114 (FBAR)",
      description: "Report of Foreign Bank and Financial Accounts",
      info: "Required if you held more than $10,000 in digital assets on foreign exchanges",
      status: "not-applicable"
    }
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tax Forms for {year}</h2>
        <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download All Forms
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {forms.map(form => (
          <Card key={form.id} className={form.status === "not-applicable" ? "opacity-70" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileIcon className="mr-2 h-5 w-5 text-blue-500" />
                  <CardTitle>{form.name}</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">{form.info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {form.status === "ready" ? (
                <div className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full inline-block">
                  Ready to download
                </div>
              ) : (
                <div className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full inline-block">
                  Not applicable
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" disabled={form.status !== "ready"}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download {form.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Important Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            These forms are for informational purposes only and should be reviewed by a qualified tax professional before filing.
          </p>
          <p>
            The IRS requires you to report all cryptocurrency sales and exchanges as capital gains or losses using Form 8949 and Schedule D.
          </p>
          <p>
            Bitcoin Tax Tracker uses the FIFO (First In, First Out) accounting method for calculating your gains and losses. 
            This is one of several methods accepted by the IRS.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 