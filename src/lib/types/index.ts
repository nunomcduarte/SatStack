import { SUBSCRIPTION_TIERS, TRANSACTION_TYPES, TAX_CLASSIFICATIONS } from '../utils/constants';

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type TaxClassification = typeof TAX_CLASSIFICATIONS[keyof typeof TAX_CLASSIFICATIONS];

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeCustomerId?: string;
  fiscalYearStart?: string; // Format: MM-DD
  preferredCurrency?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  date: string;
  bitcoin_amount: number;
  price_per_bitcoin: number;
  fiat_amount: number;
  exchange: string | null;
  wallet: string | null;
  notes: string | null;
  tax_classification: TaxClassification | null;
  created_at: string;
  updated_at: string;
}

export interface TaxLot {
  id: string;
  userId: string;
  purchaseTransactionId: string;
  purchaseDate: string;
  bitcoinAmount: number;
  costBasis: number;
  remainingBitcoin: number;
  classification: TaxClassification;
  createdAt: string;
  updatedAt: string;
  // Virtual/calculated fields
  isFullyDisposed?: boolean;
}

export interface TaxDisposal {
  id: string;
  userId: string;
  taxLotId: string;
  saleTransactionId: string;
  saleDate: string;
  bitcoinAmount: number;
  proceedsAmount: number;
  costBasisAmount: number;
  gainLoss: number;
  classification: TaxClassification;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalBitcoin: number;
  averageCostBasis: number;
  totalFiatInvested: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
}

export interface TaxSummary {
  year: number;
  totalProceeds: number;
  totalCostBasis: number;
  totalGainLoss: number;
  shortTermGainLoss: number;
  longTermGainLoss: number;
  shortTermCount: number;
  longTermCount: number;
}

export interface PriceData {
  date: string;
  price: number;
}

export interface CoinApiResponse {
  time_period_start: string;
  time_period_end: string;
  time_open: string;
  time_close: string;
  price_open: number;
  price_high: number;
  price_low: number;
  price_close: number;
  volume_traded: number;
  trades_count: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
} 