'use client'

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUpCircle, 
  ArrowDownCircle,
  ArrowRightLeft,
  CreditCard,
  Edit,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  description: string
  category_id: string | null
  account_id: string | null
  card_id: string | null
  date: string
  is_recurring: boolean
  is_paid: boolean
  created_at: string
}

interface Category {
  id: string
  name: string
  type: string
  emoji: string
  color: string
}

interface Account {
  id: string
  name: string
  type: string
  emoji: string
}

interface Card {
  id: string
  name: string
  emoji: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<{ income: Category[], expense: Category[] }>({ income: [], expense: [] })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    account: 'all',
    status: 'all'
  })
  const [sortOrder, setSortOrder] = useState('desc')

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category_id: '',
    account_id: '',
    card_id: '',
    date: new Date().toISOString().split('T')[0],
    is_paid: true,
    is_recurring: false,
    recurring_type: null
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortTransactions()
  }, [transactions, searchTerm, filters, sortOrder, currentMonth, currentYear])

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

      setTransactions(transactionsRes.data || [])
      setCategories({
        income: categoriesRes.data?.filter(c => c.type === 'income') || [],
        expense: categoriesRes.data?.filter(c => c.type === 'expense') || []
      })
      setAccounts(accountsRes.data || [])
      setCards(cardsRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      window.showNotification?.('Erro', 'Falha ao carregar transações', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortTransactions = () => {
    let filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      const isInCurrentMonth = transactionDate.getMonth() === currentMonth && 
                               transactionDate.getFullYear() === currentYear

      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filters.type === 'all' || transaction.type === filters.type
      const matchesCategory = filters.category === 'all' || transaction.category_id === filters.category
      const matchesAccount = filters.account === 'all' || transaction.account_id === filters.account
      const matchesStatus = filters.status === 'all' || 
                           (filters.status === 'paid' && transaction.is_paid) ||
                           (filters.status === 'pending' && !transaction.is_paid)

      return isInCurrentMonth && matchesSearch && matchesType && 
             matchesCategory && matchesAccount && matchesStatus
    })

    filtered.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })

    setFilteredTransactions(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpCircle className="w-5 h-5 text-green-600" />
      case 'expense':
        return <ArrowDownCircle className="w-5 h-5 text-red-600" />
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-blue-600" />
      case 'card':
        return <CreditCard className="w-5 h-5 text-orange-600" />
      default:
        return <ArrowRightLeft className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryName = (categoryId: string, type: string) => {
    if (!categoryId) return 'Sem categoria'
    const categoryList = type === 'income' ? categories.income : categories.expense
    const category = categoryList.find(c => c.id === categoryId)
    return category ? `${category.emoji} ${category.name}` : 'Categoria desconhecida'
  }

  const getAccountName = (accountId: string) => {
    if (!accountId) return 'Sem conta'
    const account = accounts.find(a => a.id === accountId)
    return account ? `${account.emoji} ${account.name}` : 'Conta desconhecida'
  }

  const navigateMonth = (direction: number) => {
    if (direction === 1) {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const transactionData = {
        ...formData,
        user_id: session.user.id,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null,
        account_id: formData.account_id || null,
        card_id: formData.card_id || null
      }

      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Transação atualizada com sucesso', 'success')
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert(transactionData)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Transação criada com sucesso', 'success')
      }

      setShowModal(false)
      setEditingTransaction(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      window.showNotification?.('Erro', 'Falha ao salvar transação', 'error')
    }
  }

  const handleEdit = (transaction: any) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category_id: transaction.category_id || '',
      account_id: transaction.account_id || '',
      card_id: transaction.card_id || '',
      date: transaction.date,
      is_paid: transaction.is_paid,
      is_recurring: transaction.is_recurring,
      recurring_type: transaction.recurring_type
    })
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      window.showNotification?.('Sucesso', 'Transação excluída com sucesso', 'success')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      window.showNotification?.('Erro', 'Falha ao excluir transação', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category_id: '',
      account_id: '',
      card_id: '',
      date: new Date().toISOString().split('T')[0],
      is_paid: true,
      is_recurring: false,
      recurring_type: null
    })
  }

  const groupTransactionsByDate = () => {
    const grouped = {}
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(transaction)
    })
    return grouped
  }

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const groupedTransactions = groupTransactionsByDate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transações
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="mx-4 font-medium text-sm">
              {getMonthName(currentMonth)} {currentYear}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setEditingTransaction(null)
              setShowModal(true)
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
              <option value="transfer">Transferências</option>
              <option value="card">Cartão</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os status</option>
              <option value="paid">Pagas</option>
              <option value="pending">Pendentes</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}
            </button>
          </div>
        </div>

        <div className="p-4">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma transação encontrada para este período
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
                const dayTotal = dayTransactions.reduce((sum, t) => {
                  if (t.type === 'income') return sum + t.amount
                  if (t.type === 'expense') return sum - t.amount
                  return sum
                }, 0)

                return (
                  <div key={date}>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {new Date(date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long'
                        })}
                      </h3>
                      <span className={`font-medium ${
                        dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {dayTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            transaction.is_paid 
                              ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {getCategoryName(transaction.category_id, transaction.type)} • {getAccountName(transaction.account_id)}
                                {!transaction.is_paid && (
                                  <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                                    Pendente
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className={`font-semibold ${
                              transaction.type === 'income' 
                                ? 'text-green-600' 
                                : transaction.type === 'expense'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                              {formatCurrency(transaction.amount)}
                            </span>
                            
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEdit(transaction)}
                                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(transaction.id)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                  <option value="transfer">Transferência</option>
                  <option value="card">Cartão</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Digite a descrição"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {(formData.type === 'income' ? categories.income : categories.expense).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conta
                </label>
                <select
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione uma conta</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.emoji} {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_paid"
                  checked={formData.is_paid}
                  onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_paid" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Transação realizada
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTransaction(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingTransaction ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
