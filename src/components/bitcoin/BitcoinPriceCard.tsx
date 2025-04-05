"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatPercentage } from "@/lib/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, RefreshCwIcon, AlertCircleIcon } from "lucide-react";
import { getCurrentPrice } from "@/lib/services/priceService";
import { LivePriceDisplay } from "./LivePriceDisplay";

interface BitcoinPriceCardProps {
  className?: string;
}

export function BitcoinPriceCard({ className = "" }: BitcoinPriceCardProps) {
  const [price, setPrice] = useState<number>(0);
  const [dailyChange, setDailyChange] = useState<number>(0);
  const [dailyPercentChange, setDailyPercentChange] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Function to fetch Bitcoin price data
  const fetchBitcoinData = async () => {
    try {
      setIsRefreshing(true);
      setError(false);
      
      // Check if our API fetch actually returns a price
      const currentPrice = await getCurrentPrice();
      
      // If the price is exactly 0, that means the API failed and we're using a fallback
      if (currentPrice === 0) {
        setError(true);
      }
      
      // In a production app, we would fetch the 24h change from the API
      // For this demo, we'll simulate a random change between -5% and +5%
      const percentChange = (Math.random() * 10 - 5);
      const priceChange = currentPrice * (percentChange / 100);
      
      setPrice(currentPrice);
      setDailyChange(priceChange);
      setDailyPercentChange(percentChange);
      
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
      setLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error fetching Bitcoin data:", error);
      setError(true);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBitcoinData();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchBitcoinData, 300000);
    
    return () => clearInterval(intervalId);
  }, []);

  const isPositiveChange = dailyPercentChange >= 0;

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <CardTitle className="text-sm font-medium">Bitcoin Price</CardTitle>
          {error && (
            <div className="ml-2 flex items-center text-amber-500" title="Using simulated data">
              <AlertCircleIcon className="h-3 w-3 mr-1" />
              <span className="text-xs">Demo</span>
            </div>
          )}
        </div>
        <button 
          onClick={fetchBitcoinData} 
          disabled={isRefreshing}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">
            <div className="h-8 bg-gray-700 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{formatCurrency(price)}</div>
            <div className={`flex items-center text-sm ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveChange ? (
                <TrendingUpIcon className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDownIcon className="mr-1 h-4 w-4" />
              )}
              <span>
                {dailyChange > 0 ? "+" : ""}{formatCurrency(dailyChange)} ({dailyPercentChange > 0 ? "+" : ""}
                {dailyPercentChange.toFixed(2)}%)
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Last updated: {lastUpdated}
            </div>
            {error && (
              <div className="mt-1 text-xs text-amber-500 flex items-center">
                <AlertCircleIcon className="h-3 w-3 mr-1" />
                <span>Using estimated price (API unavailable)</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 