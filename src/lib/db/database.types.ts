import { SUBSCRIPTION_TIERS, TRANSACTION_TYPES, TAX_CLASSIFICATIONS } from '../utils/constants';

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];
export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];
export type TaxClassification = (typeof TAX_CLASSIFICATIONS)[keyof typeof TAX_CLASSIFICATIONS];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          subscription_tier: SubscriptionTier
          stripe_customer_id: string | null
          subscription_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          subscription_tier?: SubscriptionTier
          stripe_customer_id?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          subscription_tier?: SubscriptionTier
          stripe_customer_id?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: TransactionType
          date: string
          bitcoin_amount: number
          price_per_bitcoin: number
          fiat_amount: number
          exchange: string | null
          wallet: string | null
          notes: string | null
          tax_classification: TaxClassification | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: TransactionType
          date: string
          bitcoin_amount: number
          price_per_bitcoin: number
          fiat_amount: number
          exchange?: string | null
          wallet?: string | null
          notes?: string | null
          tax_classification?: TaxClassification | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: TransactionType
          date?: string
          bitcoin_amount?: number
          price_per_bitcoin?: number
          fiat_amount?: number
          exchange?: string | null
          wallet?: string | null
          notes?: string | null
          tax_classification?: TaxClassification | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tax_lots: {
        Row: {
          id: string
          user_id: string
          transaction_id: string
          date_acquired: string
          bitcoin_amount: number
          cost_basis: number
          price_per_bitcoin: number
          remaining_bitcoin: number
          disposed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id: string
          date_acquired: string
          bitcoin_amount: number
          cost_basis: number
          price_per_bitcoin: number
          remaining_bitcoin: number
          disposed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string
          date_acquired?: string
          bitcoin_amount?: number
          cost_basis?: number
          price_per_bitcoin?: number
          remaining_bitcoin?: number
          disposed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_lots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_lots_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      tax_disposals: {
        Row: {
          id: string
          user_id: string
          transaction_id: string
          tax_lot_id: string
          date_disposed: string
          bitcoin_amount: number
          proceeds: number
          cost_basis: number
          gain_loss: number
          is_long_term: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id: string
          tax_lot_id: string
          date_disposed: string
          bitcoin_amount: number
          proceeds: number
          cost_basis: number
          gain_loss: number
          is_long_term: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string
          tax_lot_id?: string
          date_disposed?: string
          bitcoin_amount?: number
          proceeds?: number
          cost_basis?: number
          gain_loss?: number
          is_long_term?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_disposals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_disposals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_disposals_tax_lot_id_fkey"
            columns: ["tax_lot_id"]
            isOneToOne: false
            referencedRelation: "tax_lots"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 