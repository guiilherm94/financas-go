'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { 
  User as UserIcon, 
  Bell, 
  Download, 
  Upload, 
  CreditCard, 
  LogOut,
  Save,
  Trash2,
  Moon,
  Sun,
  Globe,
  Shield,
  HelpCircle
} from 'lucide-react'

interface UserProfile {
  id: string
  full_name?: string
  email: string
  subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired' | 'free'
  subscription_plan?: 'monthly' | 'yearly' | 'trial'
  subscription_end_date?: string
  created_at: string
  updated_at?: string
}

interface Subscription {
  id: string
  user_id: string
  status: string
  plan: string
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  })

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: UserIcon },
    { id: 'subscription', label: 'Assinatura', icon: CreditCard },
    { id: 'preferences', label: 'Preferências', icon: Bell },
    { id: 'data', label: 'Dados', icon: Download },
    { id: 'security', label: 'Segurança', icon: Shield }
  ]

  useEffect(() => {
    loadUserData()
    loadDarkMode()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      setUser(session.user)

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setUserData(userProfile)
      setSubscription(subscriptionData)

      if (userProfile) {
        setFormData({
          full_name: userProfile.full_name || '',
          email: userProfile.email || session.user.email || ''
        })
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDarkMode = () => {
    const saved = localStorage.getItem('finance_darkmode')
    if (saved) {
      setDarkMode(JSON.parse(saved))
    }
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('finance_darkmode', JSON.stringify(newMode))
    
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    
    window.showNotification?.('Sucesso', `Tema ${newMode ? 'escuro' : 'claro'} ativado`, 'success')
  }

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name
        })
        .eq('id', user.id)

      if (error) throw error

      if (userData) {
        setUserData({ ...userData, full_name: formData.full_name })
      }
      window.showNotification?.('Sucesso', 'Perfil atualizado com sucesso', 'success')
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      window.showNotification?.('Erro', 'Falha ao atualizar perfil', 'error')
    }
  }

  const handleLogout = async () => {
    if (!confirm('Tem certeza que deseja sair?')) return
    
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleExportData = async () => {
    if (!user) return
    
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)

      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)

      const { data: cards } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)

      const exportData = {
        user: userData,
        transactions: transactions || [],
        categories: categories || [],
        accounts: accounts || [],
        cards: cards || [],
        exported_at: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financasgo-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      window.showNotification?.('Sucesso', 'Dados exportados com sucesso', 'success')
    } catch (error: any) {
      console.error('Erro ao exportar dados:', error)
      window.showNotification?.('Erro', 'Falha ao exportar dados', 'error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    
    const confirmText = 'EXCLUIR CONTA'
    const userInput = prompt(
      `Esta ação é irreversível e todos os seus dados serão perdidos.\n\nPara confirmar, digite: ${confirmText}`
    )

    if (userInput !== confirmText) {
      window.showNotification?.('Info', 'Exclusão cancelada', 'info')
      return
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error

      window.showNotification?.('Sucesso', 'Conta excluída com sucesso', 'success')
      router.push('/')
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error)
      window.showNotification?.('Erro', 'Falha ao excluir conta', 'error')
    }
  }

  const getSubscriptionStatus = () => {
    if (!userData) return { text: 'Carregando...', color: 'gray' }
    
    switch (userData.subscription_status) {
      case 'trial':
        return { text: 'Trial Ativo', color: 'yellow' }
      case 'active':
        return { text: 'Ativo', color: 'green' }
      case 'cancelled':
        return { text: 'Cancelado', color: 'red' }
      case 'expired':
        return { text: 'Expirado', color: 'red' }
      default:
        return { text: 'Indefinido', color: 'gray' }
    }
  }

  const createSubscription = async (planType: string) => {
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (response.ok) {
        window.open(data.init_point, '_blank')
        window.showNotification?.('Info', 'Redirecionando para pagamento...', 'info')
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error)
      window.showNotification?.('Erro', 'Falha ao processar assinatura', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const TabIcon = tabs.find(tab => tab.id === activeTab)?.icon || UserIcon
  const subscriptionStatus = getSubscriptionStatus()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {userData?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {userData?.full_name || 'Usuário'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    subscriptionStatus.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    subscriptionStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    subscriptionStatus.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {subscriptionStatus.text}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    O email não pode ser alterado
                  </p>
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </button>
              </form>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Status da Assinatura
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Plano Atual: {userData?.subscription_plan === 'monthly' ? 'Mensal' : 
                                    userData?.subscription_plan === 'yearly' ? 'Anual' : 'Trial'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status: {subscriptionStatus.text}
                      </p>
                      {userData?.subscription_end_date && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Válido até: {new Date(userData.subscription_end_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {userData?.subscription_status !== 'active' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Escolha seu plano
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Plano Mensal</h5>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        R$ 4,90<span className="text-sm font-normal text-gray-500">/mês</span>
                      </p>
                      <button
                        onClick={() => createSubscription('monthly')}
                        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                      >
                        Assinar Mensal
                      </button>
                    </div>

                    <div className="border-2 border-indigo-200 dark:border-indigo-600 rounded-lg p-4 relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                          Mais Popular
                        </span>
                      </div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Plano Anual</h5>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        R$ 39,90<span className="text-sm font-normal text-gray-500">/ano</span>
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Economize R$ 18,90!
                      </p>
                      <button
                        onClick={() => createSubscription('yearly')}
                        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                      >
                        Assinar Anual
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Aparência
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Tema</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Escolha entre tema claro ou escuro
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                      {darkMode ? 'Claro' : 'Escuro'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Idioma
                </h3>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="pt-BR">Português (Brasil)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Backup e Exportação
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Exportar Dados</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Baixe todos os seus dados em formato JSON
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Conta
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sair da Conta</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Encerrar sua sessão atual
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-400">Excluir Conta</p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Apagar permanentemente sua conta e todos os dados
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
