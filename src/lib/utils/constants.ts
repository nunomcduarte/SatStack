// Application Constants

// Environment variables
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const COINAPI_KEY = process.env.NEXT_PUBLIC_COINAPI_KEY || 'YOUR_COINAPI_KEY_HERE';

// Application settings
export const APP_NAME = 'SatStack';
export const APP_DESCRIPTION = 'Bitcoin transaction tracking and tax reporting for investors, traders, and spenders';

// Subscription plans
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro'
};

// Transaction types
export const TRANSACTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  SEND: 'send',
  RECEIVE: 'receive',
  SPEND: 'spend'
};

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Tax classifications
export const TAX_CLASSIFICATIONS = {
  SHORT_TERM: 'short-term',
  LONG_TERM: 'long-term'
};

// API endpoints
export const BITCOIN_PRICE_ENDPOINT = 'https://rest.coinapi.io/v1/exchangerate/BTC/USD';
export const COINAPI_URL = 'https://rest.coinapi.io/v1';

// Add a helpful console log to debug environment variables loading
console.log('Environment variables loaded:');
console.log('- NEXT_PUBLIC_COINAPI_KEY exists:', Boolean(process.env.NEXT_PUBLIC_COINAPI_KEY));
console.log('- NEXT_PUBLIC_COINAPI_KEY first 5 chars:', process.env.NEXT_PUBLIC_COINAPI_KEY ? process.env.NEXT_PUBLIC_COINAPI_KEY.substring(0, 5) + '...' : 'not set');

// UI Constants
export const PAGINATION_LIMIT = 10; 