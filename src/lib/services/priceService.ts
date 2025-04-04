import { COINAPI_KEY, COINAPI_URL } from '@/lib/utils/constants';
import { PriceData, CoinApiResponse } from '@/lib/types';

/**
 * Fetch the current Bitcoin price
 */
export async function getCurrentPrice(): Promise<number> {
  try {
    const response = await fetch(`${COINAPI_URL}/exchangerate/BTC/USD`, {
      headers: {
        'X-CoinAPI-Key': COINAPI_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`CoinAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.rate;
  } catch (error) {
    console.error('Error fetching current Bitcoin price:', error);
    // Return a default value or throw error based on your error handling strategy
    return 0;
  }
}

/**
 * Fetch historical Bitcoin price for a specific date
 */
export async function getHistoricalPrice(date: string): Promise<number> {
  try {
    // Format date string (YYYY-MM-DD) to ISO format
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const response = await fetch(`${COINAPI_URL}/exchangerate/BTC/USD?time=${formattedDate}T12:00:00.0000000Z`, {
      headers: {
        'X-CoinAPI-Key': COINAPI_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`CoinAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.rate;
  } catch (error) {
    console.error(`Error fetching Bitcoin price for date ${date}:`, error);
    return 0;
  }
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