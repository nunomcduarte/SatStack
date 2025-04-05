"use client";

import { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, AlertCircleIcon } from "lucide-react";
import { getCurrentPrice } from "@/lib/services/priceService";
import { COINAPI_KEY } from "@/lib/utils/constants";

interface LivePriceDisplayProps {
  className?: string;
  updateInterval?: number; // in milliseconds
  compact?: boolean;
}

export function LivePriceDisplay({ 
  className = "", 
  updateInterval = 60000, // Default: update every minute
  compact = false 
}: LivePriceDisplayProps) {
  const [price, setPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const previousPrice = useRef<number>(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if CoinAPI key is properly configured
  useEffect(() => {
    const isKeyValid = Boolean(COINAPI_KEY) && 
                      typeof COINAPI_KEY === 'string' && 
                      COINAPI_KEY.length > 10 && 
                      COINAPI_KEY !== 'YOUR_COINAPI_KEY_HERE';
    setApiKeyMissing(!isKeyValid);
  }, []);

  // Function to fetch the current price
  const fetchPrice = async () => {
    try {
      setIsRefreshing(true);
      setError(false);
      const newPrice = await getCurrentPrice();
      
      if (previousPrice.current > 0) {
        // Determine if price went up or down
        if (newPrice > previousPrice.current) {
          setPriceChange('up');
        } else if (newPrice < previousPrice.current) {
          setPriceChange('down');
        }
      }
      
      previousPrice.current = newPrice;
      setPrice(newPrice);
      setLoading(false);
      setIsRefreshing(false);
      
      // Reset price change indicator after animation
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      animationTimeoutRef.current = setTimeout(() => {
        setPriceChange(null);
      }, 2000);
    } catch (error) {
      console.error("Error fetching Bitcoin price:", error);
      setError(true);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch price on component mount and set up interval
  useEffect(() => {
    fetchPrice();
    
    const intervalId = setInterval(fetchPrice, updateInterval);
    
    return () => {
      clearInterval(intervalId);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [updateInterval]);

  // Styles based on price change
  const getPriceColor = () => {
    if (priceChange === 'up') return 'text-green-500';
    if (priceChange === 'down') return 'text-red-500';
    return '';
  };

  const getAnimation = () => {
    if (priceChange === 'up') return 'transition-all duration-1000 transform';
    if (priceChange === 'down') return 'transition-all duration-1000 transform';
    return '';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 font-medium ${className}`}>
        {loading ? (
          <span className="text-sm text-gray-400">Loading price...</span>
        ) : (
          <>
            <span className={`text-sm ${getPriceColor()} ${getAnimation()}`}>BTC: {formatCurrency(price)}</span>
            {priceChange === 'up' && <ArrowUpIcon className="h-3 w-3 text-green-500" />}
            {priceChange === 'down' && <ArrowDownIcon className="h-3 w-3 text-red-500" />}
            <button
              onClick={fetchPrice}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-white transition-colors ml-1"
              title="Refresh price"
            >
              <RefreshCwIcon className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="text-xs text-gray-400">Current Bitcoin Price</div>
      <div className={`flex items-center gap-1 font-medium ${getPriceColor()} ${getAnimation()}`}>
        {loading ? (
          <div className="h-6 w-24 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <>
            <span className="text-lg">{formatCurrency(price)}</span>
            {priceChange === 'up' && <ArrowUpIcon className="h-4 w-4 text-green-500" />}
            {priceChange === 'down' && <ArrowDownIcon className="h-4 w-4 text-red-500" />}
            <button
              onClick={fetchPrice}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-white transition-colors ml-1"
              title="Refresh price"
            >
              <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </>
        )}
      </div>
      {apiKeyMissing && (
        <div className="text-xs text-amber-500 mt-1 flex items-center">
          <AlertCircleIcon className="h-3 w-3 mr-1" />
          <span>Missing CoinAPI key</span>
        </div>
      )}
      {error && !apiKeyMissing && (
        <div className="text-xs text-amber-500 mt-1">
          Using estimated price (API unavailable)
        </div>
      )}
    </div>
  );
} 