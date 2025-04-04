import supabase from '@/lib/db/supabase';
import { TransactionType, TaxClassification } from '@/lib/db/database.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all transactions for a user
 */
export async function getTransactions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(transactionId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  userId: string,
  transaction: {
    type: TransactionType;
    date: string;
    bitcoin_amount: number;
    price_per_bitcoin: number;
    fiat_amount: number;
    exchange?: string;
    wallet?: string;
    notes?: string;
    tax_classification?: TaxClassification;
  }
) {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id,
        user_id: userId,
        ...transaction,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // For purchases, create a tax lot
    if (transaction.type === 'BUY' || transaction.type === 'RECEIVE') {
      await createTaxLot(
        userId,
        id,
        transaction.date,
        transaction.bitcoin_amount,
        transaction.fiat_amount,
        transaction.price_per_bitcoin
      );
    }

    // For sells or spends, process sales
    if (transaction.type === 'SELL' || transaction.type === 'SPEND') {
      await processSale(
        userId,
        id,
        transaction.date,
        transaction.bitcoin_amount,
        transaction.fiat_amount
      );
    }

    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  updates: {
    type?: TransactionType;
    date?: string;
    bitcoin_amount?: number;
    price_per_bitcoin?: number;
    fiat_amount?: number;
    exchange?: string;
    wallet?: string;
    notes?: string;
    tax_classification?: TaxClassification;
  }
) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // TODO: Update related tax lots and disposals
    // This would require more complex logic to handle changes to transaction type, 
    // amount, etc., and potentially reprocess FIFO calculations

    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: string, userId: string) {
  try {
    // First, check if there are related tax disposals
    const { data: disposals } = await supabase
      .from('tax_disposals')
      .select('id')
      .eq('transaction_id', transactionId);

    // Delete related tax disposals if they exist
    if (disposals && disposals.length > 0) {
      const disposalIds = disposals.map(d => d.id);
      const { error: disposalsError } = await supabase
        .from('tax_disposals')
        .delete()
        .in('id', disposalIds);

      if (disposalsError) {
        throw disposalsError;
      }
    }

    // Delete related tax lot if it exists
    const { error: taxLotError } = await supabase
      .from('tax_lots')
      .delete()
      .eq('transaction_id', transactionId);

    if (taxLotError) {
      throw taxLotError;
    }

    // Finally, delete the transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

/**
 * Create a tax lot for a purchase transaction
 */
async function createTaxLot(
  userId: string,
  transactionId: string,
  dateAcquired: string,
  bitcoinAmount: number,
  costBasis: number,
  pricePerBitcoin: number
) {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const { error } = await supabase.from('tax_lots').insert({
      id,
      user_id: userId,
      transaction_id: transactionId,
      date_acquired: dateAcquired,
      bitcoin_amount: bitcoinAmount,
      cost_basis: costBasis,
      price_per_bitcoin: pricePerBitcoin,
      remaining_bitcoin: bitcoinAmount,
      disposed: false,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error creating tax lot:', error);
    throw error;
  }
}

/**
 * Process a sale transaction using FIFO method
 */
async function processSale(
  userId: string,
  transactionId: string,
  dateDisposed: string,
  bitcoinAmount: number,
  proceeds: number
) {
  try {
    // Get available tax lots ordered by acquisition date (FIFO)
    const { data: availableLots, error: lotsError } = await supabase
      .from('tax_lots')
      .select('*')
      .eq('user_id', userId)
      .eq('disposed', false)
      .gt('remaining_bitcoin', 0)
      .order('date_acquired', { ascending: true });

    if (lotsError) {
      throw lotsError;
    }

    if (!availableLots || availableLots.length === 0) {
      throw new Error('No available tax lots found for sale');
    }

    let remainingToSell = bitcoinAmount;
    let totalCostBasis = 0;
    const now = new Date().toISOString();
    const disposalDate = new Date(dateDisposed);
    
    // Process each lot using FIFO until the sale amount is fulfilled
    for (const lot of availableLots) {
      if (remainingToSell <= 0) break;

      const btcFromLot = Math.min(remainingToSell, lot.remaining_bitcoin);
      const portionOfLot = btcFromLot / lot.bitcoin_amount;
      const costBasisPortion = lot.cost_basis * portionOfLot;
      
      totalCostBasis += costBasisPortion;
      
      // Calculate if this is a long-term holding (more than 1 year)
      const acquisitionDate = new Date(lot.date_acquired);
      const holdingPeriodDays = Math.floor(
        (disposalDate.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isLongTerm = holdingPeriodDays > 365;
      
      // Create tax disposal record
      const disposalId = uuidv4();
      const proceedsPortion = (proceeds * btcFromLot) / bitcoinAmount;
      const gainLoss = proceedsPortion - costBasisPortion;
      
      const { error: disposalError } = await supabase.from('tax_disposals').insert({
        id: disposalId,
        user_id: userId,
        transaction_id: transactionId,
        tax_lot_id: lot.id,
        date_disposed: dateDisposed,
        bitcoin_amount: btcFromLot,
        proceeds: proceedsPortion,
        cost_basis: costBasisPortion,
        gain_loss: gainLoss,
        is_long_term: isLongTerm,
        created_at: now,
        updated_at: now,
      });

      if (disposalError) {
        throw disposalError;
      }

      // Update the tax lot's remaining balance
      const newRemainingBitcoin = lot.remaining_bitcoin - btcFromLot;
      const isFullyDisposed = newRemainingBitcoin <= 0;
      
      const { error: updateError } = await supabase
        .from('tax_lots')
        .update({
          remaining_bitcoin: newRemainingBitcoin,
          disposed: isFullyDisposed,
          updated_at: now,
        })
        .eq('id', lot.id);

      if (updateError) {
        throw updateError;
      }

      remainingToSell -= btcFromLot;
    }

    if (remainingToSell > 0) {
      console.warn(`Warning: Not enough tax lots to cover the entire sale of ${bitcoinAmount} BTC. Remaining: ${remainingToSell} BTC`);
    }

    return true;
  } catch (error) {
    console.error('Error processing sale:', error);
    throw error;
  }
} 