'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, CreditCard, Calendar, DollarSign } from 'lucide-react'

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

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  card_id: string
}

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
]

const DEFAULT_EMOJIS = [
  '💳', '💎', '🏛️', '🌟', '⭐', '💰', '🔥', '⚡', '🚀', '💫',
  '🎯', '🏆', '👑', '💍', '🎪', '🎭', '🎨', '🎲', '🎊', '🎁'
]

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    closing_day: '5',
    due_day: '15',
    emoji: '💳',
    color: '#6366f1'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const [cardsRes, transactionsRes] = await Promise.all([
        supabase
          .from('cards')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('type', 'card')
      ])

      if (cardsRes.error) throw cardsRes.error
      if (transactionsRes.error) throw transactionsRes.error

      setCards(cardsRes.data || [])
      setTransactions(transactionsRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar cartões:', error)
      window.showNotification?.('Erro', 'Falha ao carregar cartões', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const cardData = {
        ...formData,
        user_id: session.user.id,
        limit_amount: parseFloat(formData.limit) || 0,
        closing_day: parseInt(formData.closing_day),
        due_day: parseInt(formData.due_day)
      }

      if (editingCard) {
        const { error } = await supabase
          .from('cards')
          .update(cardData)
          .eq('id', editingCard.id)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Cartão atualizado com sucesso', 'success')
      } else {
        const { error } = await supabase
          .from('cards')
          .insert(cardData)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Cartão criado com sucesso', 'success')
      }

      setShowModal(false)
      setEditingCard(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar cartão:', error)
      window.showNotification?.('Erro', 'Falha ao salvar cartão', 'error')
    }
  }

  const handleEdit = (card: Card) => {
    setFormData({
      name: card.name,
      limit: card.limit_amount.toString(),
      closing_day: card.closing_day.toString(),
      due_day: card.due_day.toString(),
      emoji: card.emoji,
      color: card.color
    })
    setEditingCard(card)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cartão? Todas as transações relacionadas serão afetadas.')) return

    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      window.showNotification?.('Sucesso', 'Cartão excluído com sucesso', 'success')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir cartão:', error)
      window.showNotification?.('Erro', 'Falha ao excluir cartão', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      limit: '',
      closing_day: '5',
      due_day: '15',
      emoji: '💳',
      color: '#6366f1'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getCurrentMonthUsage = (cardId: string) => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    return transactions
      .filter(t => 
        t.card_id === cardId && 
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getUsagePercentage = (cardId: string, limit: number) => {
    if (limit === 0) return 0
    const usage = getCurrentMonthUsage(cardId)
    return Math.min(100, (usage / limit) * 100)
  }

  const getNextDueDate = (closingDay: number, dueDay: number) => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let dueMonth = currentMonth
    let dueYear = currentYear
    
    if (today.getDate() > closingDay) {
      dueMonth = currentMonth + 1
      if (dueMonth > 11) {
        dueMonth = 0
        dueYear = currentYear + 1
      }
    }
    
    return new Date(dueYear, dueMonth, dueDay)
  }

  const getDaysUntilDue = (closingDay: number, dueDay: number) => {
    const nextDueDate = getNextDueDate(closingDay, dueDay)
    const today = new Date()
    const diffTime = nextDueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cartões de Crédito
        </h1>
        <button
          onClick={() => {
            resetForm()
            setEditingCard(null)
            setShowModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cartão
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum cartão encontrado
              </p>
              <button
                onClick={() => {
                  resetForm()
                  setEditingCard(null)
                  setShowModal(true)
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Adicionar primeiro cartão
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cards.map((card) => {
                const currentUsage = getCurrentMonthUsage(card.id)
                const usagePercentage = getUsagePercentage(card.id, card.limit_amount)
                const daysUntilDue = getDaysUntilDue(card.closing_day, card.due_day)
                const nextDueDate = getNextDueDate(card.closing_day, card.due_day)

                return (
                  <div
                    key={card.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="p-6 text-white relative"
                      style={{ backgroundColor: card.color }}
                    >
                      <div className="absolute top-4 right-4 text-2xl opacity-20">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {card.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {card.name}
                            </h3>
                            <p className="text-sm opacity-80">
                              Limite: {formatCurrency(card.limit_amount)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(card)}
                            className="p-1 text-white hover:text-gray-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="p-1 text-white hover:text-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="opacity-80">Usado este mês</span>
                          <span className="font-medium">
                            {formatCurrency(currentUsage)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                          <div
                            className="bg-white rounded-full h-2 transition-all duration-300"
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="opacity-80">
                            {usagePercentage.toFixed(1)}% do limite
                          </span>
                          <span className="opacity-80">
                            Disponível: {formatCurrency(card.limit_amount - currentUsage)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Fechamento
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Dia {card.closing_day}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Vencimento
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Dia {card.due_day}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Próximo vencimento
                          </p>
                          <p className={`font-medium ${
                            daysUntilDue <= 3 
                              ? 'text-red-600 dark:text-red-400' 
                              : daysUntilDue <= 7 
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {daysUntilDue === 0 ? 'Hoje' : 
                             daysUntilDue === 1 ? 'Amanhã' :
                             `${daysUntilDue} dias`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Próxima fatura vence em {nextDueDate.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Nubank Roxinho"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Limite do Cartão
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dia do Fechamento
                  </label>
                  <select
                    value={formData.closing_day}
                    onChange={(e) => setFormData({ ...formData, closing_day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dia do Vencimento
                  </label>
                  <select
                    value={formData.due_day}
                    onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
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
                <div 
                  className="p-4 rounded-lg text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {formData.emoji}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formData.name || 'Nome do cartão'}
                      </p>
                      <p className="text-sm opacity-80">
                        Limite: {formData.limit ? formatCurrency(parseFloat(formData.limit)) : 'R$ 0,00'}
                      </p>
                      <p className="text-xs opacity-80">
                        Fecha dia {formData.closing_day} • Vence dia {formData.due_day}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCard(null)
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
                  {editingCard ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
