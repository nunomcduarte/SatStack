import { COINAPI_KEY, COINAPI_URL } from '@/lib/utils/constants';
import { PriceData, CoinApiResponse } from '@/lib/types';

// API key verification helper
function isCoinApiKeyValid(): boolean {
  return Boolean(COINAPI_KEY) && typeof COINAPI_KEY === 'string' && COINAPI_KEY.length > 10 && COINAPI_KEY !== 'YOUR_COINAPI_KEY_HERE';
}

/**
 * Fetch the current Bitcoin price
 */
export async function getCurrentPrice(): Promise<number> {
  try {
    console.log('Attempting to fetch current Bitcoin price from CoinAPI...');
    
    // Check if API key is properly configured
    if (!isCoinApiKeyValid()) {
      console.error('Invalid or missing CoinAPI key. Please add a valid key to your .env file.');
      console.log('Falling back to simulated price.');
      return getSimulatedPrice();
    }

    console.log('Using CoinAPI key:', COINAPI_KEY.substring(0, 5) + '...');
    
    const response = await fetch(`${COINAPI_URL}/exchangerate/BTC/USD`, {
      headers: {
        'X-CoinAPI-Key': COINAPI_KEY
      },
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store'
    });

    console.log('CoinAPI response status:', response.status);

    if (!response.ok) {
      console.warn(`CoinAPI error: ${response.status} ${response.statusText}`);
      
      // Log a more helpful message for specific errors
      if (response.status === 401) {
        console.error('CoinAPI returned 401 Unauthorized. Please check your API key.');
      } else if (response.status === 429) {
        console.error('CoinAPI rate limit exceeded. Free tier only allows 100 calls per day.');
      }
      
      console.log('Falling back to simulated price.');
      // Return a simulated price instead of throwing an error
      return getSimulatedPrice();
    }

    const data = await response.json();
    console.log('CoinAPI successfully returned data:', data);
    
    if (!data.rate || typeof data.rate !== 'number') {
      console.error('CoinAPI returned unexpected data format:', data);
      return getSimulatedPrice();
    }
    
    return data.rate;
  } catch (error) {
    console.error('Error fetching current Bitcoin price:', error);
    console.log('Falling back to simulated price.');
    // Return a simulated price on error
    return getSimulatedPrice();
  }
}

/**
 * Generate a simulated Bitcoin price when API is unavailable
 * This provides a realistic-looking price for demo purposes
 */
function getSimulatedPrice(): number {
  // More accurate price range based on recent Bitcoin market values (May 2024)
  const basePrice = 64500;
  const variance = 1500; // +/- $1,500 for more realistic variation
  
  // Store the price in localStorage to keep it consistent between page refreshes
  const storedPrice = typeof window !== 'undefined' ? localStorage.getItem('simulatedBtcPrice') : null;
  
  if (storedPrice) {
    // Add a small variation to the stored price (up to +/- 0.5%)
    const price = parseFloat(storedPrice);
    const smallVariance = price * 0.005; // 0.5% max change
    const updatedPrice = price + (Math.random() * smallVariance * 2 - smallVariance);
    
    // Store the new price
    if (typeof window !== 'undefined') {
      localStorage.setItem('simulatedBtcPrice', updatedPrice.toString());
    }
    
    return updatedPrice;
  } else {
    // Generate a new price if none exists
    const initialPrice = basePrice + (Math.random() * variance * 2 - variance);
    
    // Store it for future use
    if (typeof window !== 'undefined') {
      localStorage.setItem('simulatedBtcPrice', initialPrice.toString());
    }
    
    return initialPrice;
  }
}

/**
 * Fetch historical Bitcoin price for a specific date
 */
export async function getHistoricalPrice(date: string): Promise<number> {
  try {
    console.log(`Attempting to fetch historical Bitcoin price for date: ${date}`);
    
    // Check if API key is properly configured
    if (!isCoinApiKeyValid()) {
      console.error('Invalid or missing CoinAPI key. Please add a valid key to your .env file.');
      console.log('Falling back to simulated historical price.');
      return getSimulatedHistoricalPrice(date);
    }
    
    // Format date string (YYYY-MM-DD) to ISO format
    const formattedDate = new Date(date).toISOString().split('T')[0];
    console.log('Formatted date for API request:', formattedDate);
    
    const response = await fetch(`${COINAPI_URL}/exchangerate/BTC/USD?time=${formattedDate}T12:00:00.0000000Z`, {
      headers: {
        'X-CoinAPI-Key': COINAPI_KEY
      },
      cache: 'no-store'
    });

    console.log('CoinAPI historical price response status:', response.status);
    
    if (!response.ok) {
      console.warn(`CoinAPI error for historical price: ${response.status} ${response.statusText}`);
      
      // Log a more helpful message for specific errors
      if (response.status === 401) {
        console.error('CoinAPI returned 401 Unauthorized. Please check your API key.');
      } else if (response.status === 429) {
        console.error('CoinAPI rate limit exceeded. Free tier only allows 100 calls per day.');
      }
      
      console.log('Falling back to simulated historical price.');
      return getSimulatedHistoricalPrice(date);
    }

    const data = await response.json();
    console.log('CoinAPI successfully returned historical price data:', data);
    
    if (!data.rate || typeof data.rate !== 'number') {
      console.error('CoinAPI returned unexpected data format for historical price:', data);
      return getSimulatedHistoricalPrice(date);
    }
    
    return data.rate;
  } catch (error) {
    console.error(`Error fetching Bitcoin price for date ${date}:`, error);
    console.log('Falling back to simulated historical price.');
    return getSimulatedHistoricalPrice(date);
  }
}

/**
 * Generate a simulated historical Bitcoin price
 * Creates reasonably realistic price based on the date
 */
function getSimulatedHistoricalPrice(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  
  // Use current price as reference point
  // First try to get from localStorage or use a sensible default
  let currentPrice = 64500;
  if (typeof window !== 'undefined') {
    const storedPrice = localStorage.getItem('simulatedBtcPrice');
    if (storedPrice) {
      currentPrice = parseFloat(storedPrice);
    }
  }
  
  // If in the past, apply a discount based on how far back we go
  const yearDiff = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const totalMonthsAgo = (yearDiff * 12) + monthDiff;
  
  // Bitcoin price history approximation - more realistic model
  // Based on rough historical trend where Bitcoin has increased significantly over time
  // with periodic corrections and bull/bear market cycles
  let historicalPrice = currentPrice;
  
  if (totalMonthsAgo > 0) {
    // Approximate Bitcoin's historical growth pattern
    // Different multipliers for different time periods to match actual history
    if (totalMonthsAgo <= 12) {
      // Last year: prices were high but slightly lower than current
      historicalPrice = currentPrice * (0.7 + (0.3 * (12 - totalMonthsAgo) / 12));
    } else if (totalMonthsAgo <= 24) {
      // 1-2 years ago: middle of bull run, rising prices
      historicalPrice = currentPrice * 0.5 * (1 + (24 - totalMonthsAgo) / 12);
    } else if (totalMonthsAgo <= 36) {
      // 2-3 years ago: lower prices (bear market)
      historicalPrice = currentPrice * 0.25;
    } else if (totalMonthsAgo <= 48) {
      // 3-4 years ago: previous bull market peak
      historicalPrice = currentPrice * 0.4;
    } else if (totalMonthsAgo <= 60) {
      // 4-5 years ago: lower prices
      historicalPrice = currentPrice * 0.15;
    } else {
      // More than 5 years ago: much lower prices
      // Roughly halving for each 2 years prior
      const additionalYears = Math.floor(totalMonthsAgo / 12) - 5;
      historicalPrice = currentPrice * 0.1 / Math.pow(2, additionalYears / 2);
    }
  }
  
  // Add some randomness (up to 5%)
  const randomFactor = 0.975 + (Math.random() * 0.05);
  
  return historicalPrice * randomFactor;
}

/**
 * Fetch historical Bitcoin prices for a date range
 */
export async function getPriceHistory(
  startDate: string,
  endDate: string,
  period: 'day' | 'week' | 'month' = 'day'
): Promise<PriceData[]> {
  try {
    let periodId;
    switch (period) {
      case 'day':
        periodId = '1DAY';
        break;
      case 'week':
        periodId = '7DAY';
        break;
      case 'month':
        periodId = '1MTH';
        break;
      default:
        periodId = '1DAY';
    }

    const formattedStartDate = new Date(startDate).toISOString();
    const formattedEndDate = new Date(endDate).toISOString();
    
    const response = await fetch(
      `${COINAPI_URL}/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=${periodId}&time_start=${formattedStartDate}&time_end=${formattedEndDate}`,
      {
        headers: {
          'X-CoinAPI-Key': COINAPI_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinAPI error: ${response.status} ${response.statusText}`);
    }

    const data: CoinApiResponse[] = await response.json();
    
    // Transform the API response to our PriceData format
    return data.map(item => ({
      date: new Date(item.time_period_start).toISOString().split('T')[0],
      price: item.price_close,
      high: item.price_high,
      low: item.price_low,
      open: item.price_open,
      volume: item.volume_traded
    }));
  } catch (error) {
    console.error('Error fetching Bitcoin price history:', error);
    return [];
  }
}

/**
 * Get average Bitcoin price for a specific month
 */
export async function getMonthlyAveragePrice(year: number, month: number): Promise<number> {
  try {
    // Create date strings for the first and last day of the month
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0).toISOString();
    
    const response = await fetch(
      `${COINAPI_URL}/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=1DAY&time_start=${startDate}&time_end=${endDate}`,
      {
        headers: {
          'X-CoinAPI-Key': COINAPI_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinAPI error: ${response.status} ${response.statusText}`);
    }

    const data: CoinApiResponse[] = await response.json();
    
    // Calculate average price
    const sum = data.reduce((acc, item) => acc + item.price_close, 0);
    return sum / data.length;
  } catch (error) {
    console.error(`Error fetching average Bitcoin price for ${year}-${month}:`, error);
    return 0;
  }
} 