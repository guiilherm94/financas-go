import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_plan: 'monthly' | 'yearly' | null
          subscription_end_date: string | null
          mercadopago_customer_id: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_plan?: 'monthly' | 'yearly' | null
          subscription_end_date?: string | null
          mercadopago_customer_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_plan?: 'monthly' | 'yearly' | null
          subscription_end_date?: string | null
          mercadopago_customer_id?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          description: string
          category_id: string | null
          account_id: string | null
          card_id: string | null
          date: string
          is_recurring: boolean
          recurring_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          parent_transaction_id: string | null
          invoice_group_id: string | null
          is_paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          description: string
          category_id?: string | null
          account_id?: string | null
          card_id?: string | null
          date: string
          is_recurring?: boolean
          recurring_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          parent_transaction_id?: string | null
          invoice_group_id?: string | null
          is_paid?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          description?: string
          category_id?: string | null
          account_id?: string | null
          card_id?: string | null
          date?: string
          is_recurring?: boolean
          recurring_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          parent_transaction_id?: string | null
          invoice_group_id?: string | null
          is_paid?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          emoji: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          emoji: string
          color: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          emoji?: string
          color?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'investment' | 'cash'
          balance: number
          emoji: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'investment' | 'cash'
          balance: number
          emoji: string
          color: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'investment' | 'cash'
          balance?: number
          emoji?: string
          color?: string
        }
      }
      cards: {
        Row: {
          id: string
          user_id: string
          name: string
          limit: number
          closing_day: number
          due_day: number
          emoji: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          limit: number
          closing_day: number
          due_day: number
          emoji: string
          color: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          limit?: number
          closing_day?: number
          due_day?: number
          emoji?: string
          color?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          mercadopago_subscription_id: string
          plan: 'monthly' | 'yearly'
          status: 'pending' | 'authorized' | 'paused' | 'cancelled'
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mercadopago_subscription_id: string
          plan: 'monthly' | 'yearly'
          status: 'pending' | 'authorized' | 'paused' | 'cancelled'
          amount: number
        }
        Update: {
          id?: string
          user_id?: string
          mercadopago_subscription_id?: string
          plan?: 'monthly' | 'yearly'
          status?: 'pending' | 'authorized' | 'paused' | 'cancelled'
          amount?: number
        }
      }
    }
  }
}
