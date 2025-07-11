export interface User {
  id: string
  email: string
  full_name?: string
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
  subscription_plan?: 'monthly' | 'yearly'
  subscription_end_date?: string
  mercadopago_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'income' | 'expense' | 'transfer' | 'card'
  amount: number
  description: string
  category_id?: string
  account_id?: string
  card_id?: string
  date: string
  is_recurring: boolean
  recurring_type?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  parent_transaction_id?: string
  invoice_group_id?: string
  is_paid: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  emoji: string
  color: string
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: 'checking' | 'savings' | 'investment' | 'cash'
  balance: number
  emoji: string
  color: string
  created_at: string
}

export interface Card {
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

export interface Subscription {
  id: string
  user_id: string
  mercadopago_subscription_id: string
  plan: 'monthly' | 'yearly'
  status: 'pending' | 'authorized' | 'paused' | 'cancelled'
  amount: number
  created_at: string
  updated_at: string
}

export interface NotificationProps {
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyBalance: number
}

export interface ChartData {
  labels: string[]
  income: number[]
  expense: number[]
}

export interface SimulatorData {
  investment: {
    initialAmount: string
    monthlyAmount: string
    annualRate: string
    period: string
  }
  financing: {
    amount: string
    downPayment: string
    annualRate: string
    period: string
  }
  retirement: {
    currentAge: string
    retirementAge: string
    monthlyExpenses: string
    currentSavings: string
    monthlyContribution: string
    expectedReturn: string
  }
  goal: {
    goalAmount: string
    currentAmount: string
    monthlyContribution: string
    expectedReturn: string
    timeFrame: string
  }
}

declare global {
  interface Window {
    showNotification: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
  }
}
