import supabase from '@/lib/db/supabase';
import { TaxSummary } from '@/lib/types';

/**
 * Get all tax disposals for a user
 */
export async function getTaxDisposals(userId: string, year?: number) {
  try {
    let query = supabase
      .from('tax_disposals')
      .select(`
        id, 
        date_disposed, 
        bitcoin_amount, 
        proceeds, 
        cost_basis, 
        gain_loss, 
        is_long_term,
        transactions:transaction_id (date, type),
        tax_lots:tax_lot_id (date_acquired)
      `)
      .eq('user_id', userId)
      .order('date_disposed', { ascending: false });

    // Filter by year if provided
    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('date_disposed', startDate).lte('date_disposed', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching tax disposals:', error);
    throw error;
  }
}

/**
 * Get tax summary for a specific year
 */
export async function getTaxSummary(userId: string, year: number): Promise<TaxSummary> {
  try {
    const taxDisposals = await getTaxDisposals(userId, year);

    if (!taxDisposals || taxDisposals.length === 0) {
      return {
        year,
        totalProceeds: 0,
        totalCostBasis: 0,
        totalGainLoss: 0,
        shortTermGainLoss: 0,
        longTermGainLoss: 0,
        shortTermCount: 0,
        longTermCount: 0
      };
    }

    let totalProceeds = 0;
    let totalCostBasis = 0;
    let shortTermGainLoss = 0;
    let longTermGainLoss = 0;
    let shortTermCount = 0;
    let longTermCount = 0;

    for (const disposal of taxDisposals) {
      totalProceeds += disposal.proceeds;
      totalCostBasis += disposal.cost_basis;

      if (disposal.is_long_term) {
        longTermGainLoss += disposal.gain_loss;
        longTermCount++;
      } else {
        shortTermGainLoss += disposal.gain_loss;
        shortTermCount++;
      }
    }

    return {
      year,
      totalProceeds,
      totalCostBasis,
      totalGainLoss: totalProceeds - totalCostBasis,
      shortTermGainLoss,
      longTermGainLoss,
      shortTermCount,
      longTermCount
    };
  } catch (error) {
    console.error('Error generating tax summary:', error);
    throw error;
  }
}

/**
 * Get tax summaries for multiple years
 */
export async function getTaxSummaries(userId: string, years?: number[]): Promise<TaxSummary[]> {
  try {
    // If years aren't specified, get all years with transactions
    if (!years || years.length === 0) {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('date')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const yearSet = new Set<number>();
      transactions.forEach(tx => {
        const year = new Date(tx.date).getFullYear();
        yearSet.add(year);
      });

      years = Array.from(yearSet).sort();
    }

    // Get tax summary for each year
    const summaries = await Promise.all(
      years.map(year => getTaxSummary(userId, year))
    );

    return summaries;
  } catch (error) {
    console.error('Error generating tax summaries:', error);
    throw error;
  }
}

/**
 * Generate a CSV format of tax disposals for a specific year
 */
export async function generateTaxCsv(userId: string, year: number): Promise<string> {
  try {
    const disposals = await getTaxDisposals(userId, year);

    if (!disposals || disposals.length === 0) {
      return 'No tax disposals found for the selected year.';
    }

    // Define CSV header
    const headers = [
      'Date Acquired',
      'Date Disposed',
      'Bitcoin Amount',
      'Proceeds',
      'Cost Basis',
      'Gain/Loss',
      'Term'
    ];

    // Create CSV rows
    const rows = disposals.map(disposal => {
      // @ts-ignore - Handle nested join results
      const dateAcquired = disposal.tax_lots?.date_acquired || 'Unknown';
      
      return [
        dateAcquired,
        disposal.date_disposed,
        disposal.bitcoin_amount.toString(),
        disposal.proceeds.toString(),
        disposal.cost_basis.toString(),
        disposal.gain_loss.toString(),
        disposal.is_long_term ? 'Long Term' : 'Short Term'
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error generating tax CSV:', error);
    throw error;
  }
} 