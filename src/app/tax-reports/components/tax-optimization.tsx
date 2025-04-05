"use client"

import { useMemo } from "react"
import { 
  ChevronRightIcon, 
  TrendingDownIcon, 
  TrendingUpIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  InfoIcon 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Transaction } from "@/lib/stores/transactionsStore"

interface TaxStrategy {
  id: string;
  title: string;
  description: string;
  status: "opportunity" | "implemented" | "not-applicable";
  impact: number;
  difficulty: "low" | "medium" | "high";
  steps: string[];
}

interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: "high" | "medium" | "low";
}

interface TaxOptimizationProps {
  year: string;
  transactions: Transaction[];
  currentPrice: number;
}

export default function TaxOptimization({ year, transactions, currentPrice }: TaxOptimizationProps) {
  // Calculate tax optimization opportunities based on transaction history
  const taxStrategies = useMemo(() => {
    // Filter to current year's transactions
    const yearTransactions = transactions.filter(tx => tx.date.startsWith(year));
    
    // Check for potential tax-loss harvesting opportunities
    const unrealizedLosses = calculateUnrealizedLosses(transactions, currentPrice);
    const hasLossOpportunities = unrealizedLosses > 0;
    
    // Check for long-term holding strategy implementation
    const longTermHoldings = transactions.filter(tx => {
      if (tx.type !== 'buy') return false;
      
      const buyDate = new Date(tx.date);
      const now = new Date();
      const holdingDays = Math.floor((now.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
      return holdingDays > 365;
    });
    
    const hasLongTermStrategy = longTermHoldings.length > 0;
    
    // Calculate potential impact of tax-loss harvesting
    const taxLossImpact = hasLossOpportunities ? Math.round(unrealizedLosses * 0.15) : 0;
    
    // Calculate potential long-term impact (simplification - assumes 10% tax savings)
    const longTermImpact = hasLongTermStrategy 
      ? Math.round(longTermHoldings.reduce((sum, tx) => sum + tx.fiatAmount * 0.1, 0))
      : 0;
    
    return [
      {
        id: "tax-loss-harvesting",
        title: "Tax-Loss Harvesting",
        description: "Sell Bitcoin at a loss to offset capital gains taxes",
        status: hasLossOpportunities ? "opportunity" : "not-applicable",
        impact: taxLossImpact,
        difficulty: "medium",
        steps: [
          "Identify Bitcoin held at a loss",
          "Sell to realize the loss",
          "Use the loss to offset gains or income"
        ]
      },
      {
        id: "long-term-holding",
        title: "Long-Term Holding",
        description: "Hold Bitcoin for more than a year to qualify for lower long-term capital gains tax rates",
        status: hasLongTermStrategy ? "implemented" : "opportunity",
        impact: longTermImpact,
        difficulty: "low",
        steps: [
          "Hold Bitcoin for at least 1 year + 1 day",
          "Sell after the holding period to receive long-term rate"
        ]
      },
      {
        id: "tax-deferred-account",
        title: "Tax-Deferred Account",
        description: "Use a tax-deferred account like a self-directed IRA for Bitcoin investments",
        status: "not-applicable",
        impact: 0,
        difficulty: "high",
        steps: [
          "Set up a self-directed IRA",
          "Find a qualified custodian",
          "Purchase Bitcoin through the IRA"
        ]
      }
    ] as TaxStrategy[];
  }, [transactions, currentPrice, year]);
  
  // Generate recommended actions based on transaction history
  const recommendedActions = useMemo(() => {
    const actions: RecommendedAction[] = [];
    const unrealizedLosses = calculateUnrealizedLosses(transactions, currentPrice);
    
    // Check for near year-end tax loss harvesting opportunity
    if (unrealizedLosses > 0) {
      actions.push({
        id: "action-1",
        title: `Realize $${unrealizedLosses.toLocaleString(undefined, { maximumFractionDigits: 0 })} in losses before year-end`,
        description: "You have unrealized losses that could offset some of your gains this year",
        impact: `$${Math.round(unrealizedLosses * 0.15).toLocaleString()} estimated tax savings`,
        priority: "high"
      });
    }
    
    // Check for potential year-end deferral opportunity
    const potentialSellTransactions = transactions.filter(tx => 
      tx.type === 'buy' && 
      new Date(tx.date).getFullYear() === Number(year) &&
      tx.pricePerBitcoin < currentPrice
    );
    
    if (potentialSellTransactions.length > 0) {
      const totalBtc = potentialSellTransactions.reduce((sum, tx) => sum + tx.bitcoinAmount, 0);
      const estimated = Math.round(totalBtc * 0.5 * currentPrice * 0.15);
      
      if (estimated > 0) {
        actions.push({
          id: "action-2",
          title: `Delay selling ${totalBtc.toFixed(2)} BTC until January`,
          description: "Pushing the sale to next year would reduce this year's tax burden",
          impact: `$${estimated.toLocaleString()} tax delayed to next year`,
          priority: "medium"
        });
      }
    }
    
    return actions;
  }, [transactions, currentPrice, year]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Tax Optimization Strategies</h2>
          <p className="text-sm text-muted-foreground">Optimize your Bitcoin tax position for {year}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-blue-500 hover:text-blue-600 cursor-pointer">
                <InfoIcon className="h-4 w-4 mr-1" />
                <span>About tax strategies</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <p className="text-xs">
                These optimization strategies are suggestions based on your transaction history. 
                Always consult with a tax professional before implementing any tax strategy.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {taxStrategies.map(strategy => (
          <Card key={strategy.id} className={
            strategy.status === "opportunity" 
              ? "border-blue-200 dark:border-blue-900" 
              : strategy.status === "implemented"
                ? "border-green-200 dark:border-green-900"
                : ""
          }>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{strategy.title}</CardTitle>
                {strategy.status === "opportunity" && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Opportunity
                  </span>
                )}
                {strategy.status === "implemented" && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                    Implemented
                  </span>
                )}
              </div>
              <CardDescription>{strategy.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {strategy.status !== "not-applicable" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Potential savings</span>
                    <span className="font-medium">${strategy.impact}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Difficulty</span>
                    <span className="capitalize">{strategy.difficulty}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Implementation steps:</span>
                <ul className="text-sm space-y-1">
                  {strategy.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-xs mr-2 mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {strategy.status === "opportunity" && (
                <Button size="sm" className="w-full mt-2">
                  Implement Strategy
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {recommendedActions.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <CardTitle>Recommended Actions for {year}</CardTitle>
            </div>
            <CardDescription>Take these actions to optimize your tax position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedActions.map(action => (
                <div key={action.id} className="flex gap-4 items-start border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full ${
                    action.priority === "high" 
                      ? "bg-red-100 dark:bg-red-900" 
                      : "bg-yellow-100 dark:bg-yellow-900"
                  }`}>
                    <TrendingDownIcon className={`h-5 w-5 ${
                      action.priority === "high"
                        ? "text-red-600 dark:text-red-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {action.impact}
                      </span>
                      <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                        {action.priority === "high" ? "High priority" : "Medium priority"}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRightIcon className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2" />
            <CardTitle>Disclaimer</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            The tax optimization strategies and recommendations provided here are for informational purposes only and are not tax, legal, or investment advice.
          </p>
          <p>
            Every individual's tax situation is unique, and these strategies may not be appropriate for everyone. 
            Please consult with a qualified tax professional before implementing any tax strategy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to calculate unrealized losses in the portfolio
function calculateUnrealizedLosses(transactions: Transaction[], currentPrice: number): number {
  let totalLosses = 0;
  
  // Get all buy transactions
  const buyTransactions = transactions.filter(tx => tx.type === 'buy');
  
  // Check each buy transaction for unrealized loss
  buyTransactions.forEach(tx => {
    const boughtPrice = tx.pricePerBitcoin;
    
    // If current price is lower than bought price, there's an unrealized loss
    if (currentPrice < boughtPrice) {
      const lossPerBitcoin = boughtPrice - currentPrice;
      const totalLoss = lossPerBitcoin * tx.bitcoinAmount;
      totalLosses += totalLoss;
    }
  });
  
  return totalLosses;
} 