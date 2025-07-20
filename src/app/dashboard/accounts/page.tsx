'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Building2, PiggyBank, TrendingUp, Wallet } from 'lucide-react'

interface Account {
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  emoji: string
  color: string
  created_at: string
}

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Conta Corrente', icon: Building2 },
  { value: 'savings', label: 'Conta Poupança', icon: PiggyBank },
  { value: 'investment', label: 'Investimentos', icon: TrendingUp },
  { value: 'cash', label: 'Dinheiro', icon: Wallet }
]

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
]

const DEFAULT_EMOJIS = [
  '🏦', '💳', '💰', '💵', '💎', '🏛️', '💼', '🎯', '💸', '📊',
  '📈', '📉', '💹', '🪙', '💴', '💶', '💷', '🔒', '🗝️', '💯'
]

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    emoji: '🏦',
    color: '#6366f1'
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setAccounts(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar contas:', error)
      window.showNotification?.('Erro', 'Falha ao carregar contas', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const accountData = {
        ...formData,
        user_id: session.user.id,
        balance: parseFloat(formData.balance) || 0
      }

      if (editingAccount) {
        const { error } = await supabase
          .from('accounts')
          .update(accountData)
          .eq('id', editingAccount.id)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Conta atualizada com sucesso', 'success')
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert(accountData)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Conta criada com sucesso', 'success')
      }

      setShowModal(false)
      setEditingAccount(null)
      resetForm()
      loadAccounts()
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error)
      window.showNotification?.('Erro', 'Falha ao salvar conta', 'error')
    }
  }

  const handleEdit = (account: Account) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      emoji: account.emoji,
      color: account.color
    })
    setEditingAccount(account)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Todas as transações relacionadas serão afetadas.')) return

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      window.showNotification?.('Sucesso', 'Conta excluída com sucesso', 'success')
      loadAccounts()
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error)
      window.showNotification?.('Erro', 'Falha ao excluir conta', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'checking',
      balance: '',
      emoji: '🏦',
      color: '#6366f1'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0)
  }

  const getAccountTypeLabel = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type)
    return accountType ? accountType.label : type
  }

  const getAccountTypeIcon = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type)
    const IconComponent = accountType ? accountType.icon : Building2
    return <IconComponent className="w-4 h-4" />
  }

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Saldo total: <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(getTotalBalance())}
            </span>
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingAccount(null)
            setShowModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma conta encontrada
              </p>
              <button
                onClick={() => {
                  resetForm()
                  setEditingAccount(null)
                  setShowModal(true)
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Criar primeira conta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: account.color + '20', color: account.color }}
                      >
                        {account.emoji}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {account.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {getAccountTypeIcon(account.type)}
                          <span className="ml-1">{getAccountTypeLabel(account.type)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Saldo atual
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Criada em
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(account.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Conta Corrente Banco do Brasil"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Conta
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {ACCOUNT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saldo Inicial
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                  {DEFAULT_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-600 ${
                        formData.emoji === emoji ? 'bg-indigo-100 dark:bg-indigo-900' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: formData.color + '20', color: formData.color }}
                  >
                    {formData.emoji}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.name || 'Nome da conta'}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {getAccountTypeIcon(formData.type)}
                      <span className="ml-1">{getAccountTypeLabel(formData.type)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Saldo: {formData.balance ? formatCurrency(parseFloat(formData.balance)) : 'R$ 0,00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAccount(null)
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
                  {editingAccount ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
