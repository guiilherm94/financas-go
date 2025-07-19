'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  emoji: string
  color: string
  created_at: string
}

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
]

const DEFAULT_EMOJIS = [
  '💰', '💵', '💳', '📈', '📉', '💹', '💸', '🏦', '🏠', '🏢', 
  '🔧', '🧹', '🛋️', '⚡', '💧', '🔥', '📶', '📱', '🚗', '🚕', 
  '🚌', '⛽', '🚲', '✈️', '🛒', '👕', '👞', '🧴', '🛍️', '🍔', 
  '🍝', '☕', '🍲', '🍺', '🎬', '🎮', '📚', '🎭', '🎵', '🏖️', 
  '💊', '🏥', '🦷', '👓', '🧠', '🏋️', '🧘', '🏃', '💆', '🥗', 
  '💼', '📊', '🖥️', '👔', '🎓', '🔬'
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ income: Category[], expense: Category[] }>({ income: [], expense: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense')
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    emoji: '💰',
    color: '#ef4444'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.user.id)

      if (error) throw error

      setCategories({
        income: data?.filter(c => c.type === 'income') || [],
        expense: data?.filter(c => c.type === 'expense') || []
      })
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      window.showNotification?.('Erro', 'Falha ao carregar categorias', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const categoryData = {
        ...formData,
        user_id: session.user.id
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Categoria atualizada com sucesso', 'success')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData)

        if (error) throw error
        window.showNotification?.('Sucesso', 'Categoria criada com sucesso', 'success')
      }

      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      loadCategories()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      window.showNotification?.('Erro', 'Falha ao salvar categoria', 'error')
    }
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type,
      emoji: category.emoji,
      color: category.color
    })
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      window.showNotification?.('Sucesso', 'Categoria excluída com sucesso', 'success')
      loadCategories()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      window.showNotification?.('Erro', 'Falha ao excluir categoria', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      emoji: '💰',
      color: '#ef4444'
    })
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
          Categorias
        </h1>
        <button
          onClick={() => {
            resetForm()
            setEditingCategory(null)
            setFormData({ ...formData, type: activeTab })
            setShowModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('expense')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expense'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <ArrowDown className="w-4 h-4 inline mr-2" />
              Despesas ({categories.expense.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'income'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <ArrowUp className="w-4 h-4 inline mr-2" />
              Receitas ({categories.income.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {categories[activeTab].length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">
                {activeTab === 'expense' ? '💸' : '💰'}
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma categoria de {activeTab === 'expense' ? 'despesa' : 'receita'} encontrada
              </p>
              <button
                onClick={() => {
                  resetForm()
                  setEditingCategory(null)
                  setFormData({ ...formData, type: activeTab })
                  setShowModal(true)
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Criar primeira categoria
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories[activeTab].map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {category.emoji}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category.type === 'income' ? 'Receita' : 'Despesa'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div
                    className="w-full h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
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
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome da categoria"
                  required
                />
              </div>

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
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emoji
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
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: formData.color + '20', color: formData.color }}
                  >
                    {formData.emoji}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.name || 'Nome da categoria'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.type === 'income' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
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
                  {editingCategory ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
