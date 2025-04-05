import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TransactionType } from '@/lib/types'

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  bitcoinAmount: number;
  pricePerBitcoin: number;
  fiatAmount: number;
  description?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  clearTransactions: () => void;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: [],
      
      addTransaction: (transaction) => 
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        })),
      
      removeTransaction: (id) => 
        set((state) => ({
          transactions: state.transactions.filter(t => t.id !== id)
        })),
      
      updateTransaction: (id, updatedTransaction) => 
        set((state) => ({
          transactions: state.transactions.map(t => 
            t.id === id ? { ...t, ...updatedTransaction } : t
          )
        })),
      
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'satstack-transactions',
    }
  )
); 