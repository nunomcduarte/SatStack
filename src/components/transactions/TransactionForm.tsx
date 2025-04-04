'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { getCurrentPrice, getHistoricalPrice } from '@/lib/services/priceService';
import { createTransaction, updateTransaction } from '@/lib/services/transactionService';
import { formatCurrency, formatBitcoin } from '@/lib/utils/helpers';
import { TRANSACTION_TYPES, TAX_CLASSIFICATIONS } from '@/lib/utils/constants';
import { useAuth } from '@/lib/auth/AuthContext';

// Form validation schema
const transactionSchema = z.object({
  type: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  bitcoin_amount: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: 'Bitcoin amount must be a valid number',
  }),
  price_per_bitcoin: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: 'Price per bitcoin must be a valid number',
  }),
  fiat_amount: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: 'Fiat amount must be a valid number',
  }),
  exchange: z.string().optional(),
  wallet: z.string().optional(),
  notes: z.string().optional(),
  tax_classification: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transactionId?: string;
  defaultValues?: TransactionFormData;
  onSuccess?: () => void;
}

export default function TransactionForm({ 
  transactionId, 
  defaultValues,
  onSuccess 
}: TransactionFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    watch,
    trigger,
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues || {
      type: 'BUY',
      date: new Date().toISOString().split('T')[0],
      bitcoin_amount: '',
      price_per_bitcoin: '',
      fiat_amount: '',
      exchange: '',
      wallet: '',
      notes: '',
      tax_classification: ''
    },
  });

  const watchType = watch('type');
  const watchDate = watch('date');
  const watchBitcoinAmount = watch('bitcoin_amount');
  const watchPricePerBitcoin = watch('price_per_bitcoin');
  const watchFiatAmount = watch('fiat_amount');

  // Fetch current Bitcoin price when the component loads
  useEffect(() => {
    if (!defaultValues) {
      fetchCurrentPrice();
    }
  }, [defaultValues]);

  // Calculate fiat amount when Bitcoin amount or price changes
  useEffect(() => {
    const bitcoinAmount = parseFloat(watchBitcoinAmount || '0');
    const pricePerBitcoin = parseFloat(watchPricePerBitcoin || '0');
    
    if (!isNaN(bitcoinAmount) && !isNaN(pricePerBitcoin)) {
      const fiatAmount = bitcoinAmount * pricePerBitcoin;
      setValue('fiat_amount', fiatAmount.toFixed(2));
    }
  }, [watchBitcoinAmount, watchPricePerBitcoin, setValue]);

  // Calculate Bitcoin amount when fiat amount or price changes
  useEffect(() => {
    const fiatAmount = parseFloat(watchFiatAmount || '0');
    const pricePerBitcoin = parseFloat(watchPricePerBitcoin || '0');
    
    if (!isNaN(fiatAmount) && !isNaN(pricePerBitcoin) && pricePerBitcoin > 0) {
      const bitcoinAmount = fiatAmount / pricePerBitcoin;
      setValue('bitcoin_amount', bitcoinAmount.toFixed(8));
    }
  }, [watchFiatAmount, watchPricePerBitcoin, setValue]);

  const fetchCurrentPrice = async () => {
    try {
      setPriceLoading(true);
      const price = await getCurrentPrice();
      if (price > 0) {
        setValue('price_per_bitcoin', price.toFixed(2));
      }
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchHistoricalPrice = async () => {
    if (!watchDate) return;
    
    try {
      setPriceLoading(true);
      const price = await getHistoricalPrice(watchDate);
      if (price > 0) {
        setValue('price_per_bitcoin', price.toFixed(2));
      }
    } catch (error) {
      console.error('Error fetching historical Bitcoin price:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const transactionData = {
        type: data.type,
        date: data.date,
        bitcoin_amount: parseFloat(data.bitcoin_amount),
        price_per_bitcoin: parseFloat(data.price_per_bitcoin),
        fiat_amount: parseFloat(data.fiat_amount),
        exchange: data.exchange,
        wallet: data.wallet,
        notes: data.notes,
        tax_classification: data.tax_classification as any,
      };

      if (transactionId) {
        // Update existing transaction
        await updateTransaction(transactionId, user.id, transactionData);
      } else {
        // Create new transaction
        await createTransaction(user.id, transactionData);
        reset();
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/transactions');
      }
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      setError(error.message || 'Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Transaction Type
          </label>
          <select
            id="type"
            {...register('type')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <div className="flex">
            <input
              type="date"
              id="date"
              {...register('date')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={fetchHistoricalPrice}
              className="ml-2 mt-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={priceLoading}
            >
              {priceLoading ? 'Loading...' : 'Get Price'}
            </button>
          </div>
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>
        
        {/* Bitcoin Amount */}
        <div>
          <label htmlFor="bitcoin_amount" className="block text-sm font-medium text-gray-700">
            Bitcoin Amount
          </label>
          <input
            type="number"
            id="bitcoin_amount"
            step="0.00000001"
            min="0"
            {...register('bitcoin_amount')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.bitcoin_amount && <p className="mt-1 text-sm text-red-600">{errors.bitcoin_amount.message}</p>}
        </div>
        
        {/* Price Per Bitcoin */}
        <div>
          <label htmlFor="price_per_bitcoin" className="block text-sm font-medium text-gray-700">
            Price Per Bitcoin (USD)
          </label>
          <input
            type="number"
            id="price_per_bitcoin"
            step="0.01"
            min="0"
            {...register('price_per_bitcoin')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.price_per_bitcoin && <p className="mt-1 text-sm text-red-600">{errors.price_per_bitcoin.message}</p>}
        </div>
        
        {/* Fiat Amount */}
        <div>
          <label htmlFor="fiat_amount" className="block text-sm font-medium text-gray-700">
            Fiat Amount (USD)
          </label>
          <input
            type="number"
            id="fiat_amount"
            step="0.01"
            min="0"
            {...register('fiat_amount')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.fiat_amount && <p className="mt-1 text-sm text-red-600">{errors.fiat_amount.message}</p>}
        </div>

        {/* Exchange */}
        <div>
          <label htmlFor="exchange" className="block text-sm font-medium text-gray-700">
            Exchange
          </label>
          <input
            type="text"
            id="exchange"
            {...register('exchange')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.exchange && <p className="mt-1 text-sm text-red-600">{errors.exchange.message}</p>}
        </div>
        
        {/* Wallet */}
        <div>
          <label htmlFor="wallet" className="block text-sm font-medium text-gray-700">
            Wallet
          </label>
          <input
            type="text"
            id="wallet"
            {...register('wallet')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.wallet && <p className="mt-1 text-sm text-red-600">{errors.wallet.message}</p>}
        </div>
        
        {/* Tax Classification */}
        <div>
          <label htmlFor="tax_classification" className="block text-sm font-medium text-gray-700">
            Tax Classification
          </label>
          <select
            id="tax_classification"
            {...register('tax_classification')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select classification</option>
            {Object.entries(TAX_CLASSIFICATIONS).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          {errors.tax_classification && <p className="mt-1 text-sm text-red-600">{errors.tax_classification.message}</p>}
        </div>
        
        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? 'Saving...' : transactionId ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
} 