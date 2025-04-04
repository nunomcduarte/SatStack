import { format, parseISO } from 'date-fns';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

/**
 * Format a date string to the application's standard date format
 */
export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), DATE_FORMAT);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format a date string to the application's standard datetime format
 */
export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), DATETIME_FORMAT);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a Bitcoin amount with appropriate decimal places
 */
export function formatBitcoin(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8,
    minimumFractionDigits: 2,
  }).format(amount) + ' BTC';
}

/**
 * Calculate total value of Bitcoin amount at a specific price
 */
export function calculateValue(bitcoinAmount: number, pricePerBitcoin: number): number {
  return bitcoinAmount * pricePerBitcoin;
}

/**
 * Calculate profit/loss for a transaction
 */
export function calculateProfitLoss(costBasis: number, saleAmount: number): number {
  return saleAmount - costBasis;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Generate a random ID for temporary usage
 */
export function generateTempId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Determine if a holding is long-term (more than 1 year)
 */
export function isLongTermHolding(purchaseDate: string, saleDate: string): boolean {
  const purchase = new Date(purchaseDate);
  const sale = new Date(saleDate);
  const diffTime = Math.abs(sale.getTime() - purchase.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 365;
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
} 