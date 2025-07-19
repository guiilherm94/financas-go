'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Calendar,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react'

interface Transaction {
  id: string
  user_id: string
  amount: number
  description: string
  date: string
  type: string
  category_id?: string
  account_id?: string
  card_id?: string
  created_at: string
}

interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  emoji: string
  color: string
  created_at: string
}

interface Account {
  id: string
  user_id: string
  name: string
  balance: number
  type: string
  emoji: string
  color: string
  created_at: string
}

interface Card {
  id: string
  user_id: string
  name: string
  limit_amount: number
  closing_day: number
  due_day: number
  emoji: string
  color: string
  created_at: string
}

export default function DashboardPage() {
  const [data, setData] = useState<{
    transactions: Transaction[]
    categories: { income: Category[], expense: Category[] }
    accounts: Account[]
    cards: Card[]
  }>({
    transactions: [],
    categories: { income: [], expense: [] },
    accounts: [],
    cards: []
  })
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const [transactionsRes, categoriesRes, accountsRes, cardsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', session.user.id),
        supabase.from('categories').select('*').eq('user_id', session.user.id),
        supabase.from('accounts').select('*').eq('user_id', session.user.id),
        supabase.from('cards').select('*').eq('user_id', session.user.id)
      ])

      setData({
        transactions: transactionsRes.data || [],
        categories: {
          income: categoriesRes.data?.filter(c => c.type === 'income') || [],
          expense: categoriesRes.data?.filter(c => c.type === 'expense') || []
        },
        accounts: accountsRes.data || [],
        cards: cardsRes.data || []
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getMonthlyStats = () => {
    const monthTransactions = data.transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses

    return { income, expenses, balance, transactionCount: monthTransactions.length }
  }

  const getTotalBalance = () => {
    return data.accounts.reduce((sum, account) => sum + account.balance, 0)
  }

  const getRecentTransactions = () => {
    return data.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }

  const stats = getMonthlyStats()
  const totalBalance = getTotalBalance()
  const recentTransactions = getRecentTransactions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11)
                  setCurrentYear(currentYear - 1)
                } else {
                  setCurrentMonth(currentMonth - 1)
                }
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              ←
            </button>
            <span className="mx-4 font-medium">
              {new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <button
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0)
                  setCurrentYear(currentYear + 1)
                } else {
                  setCurrentMonth(currentMonth + 1)
                }
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              →
            </button>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Saldo Total
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Receitas do Mês
              </h3>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(stats.income)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Gastos do Mês
              </h3>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(stats.expenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              stats.balance >= 0 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              <Calendar className={`w-6 h-6 ${
                stats.balance >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Saldo do Mês
              </h3>
              <p className={`text-2xl font-semibold ${
                stats.balance >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transações Recentes
            </h2>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma transação encontrada
              </p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contas
            </h2>
          </div>
          <div className="p-6">
            {data.accounts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma conta cadastrada
              </p>
            ) : (
              <div className="space-y-4">
                {data.accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-sm">{account.emoji}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.type}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
