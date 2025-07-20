'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import NotificationSystem from './NotificationSystem'
import DashboardPage from '@/app/dashboard/page'
import TransactionsPage from '@/app/dashboard/transactions/page'
import CategoriesPage from '@/app/dashboard/categories/page'
import AccountsPage from '@/app/dashboard/accounts/page'
import CardsPage from '@/app/dashboard/cards/page'
import SettingsPage from '@/app/dashboard/settings/page'
import SimulatorPage from '@/app/dashboard/simulator/page'

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
  recurring_type: string | null
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

export default function DashboardClient({ 
  user, 
  userData, 
  children 
}: { 
  user: any
  userData: any
  children: React.ReactNode 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentView, setCurrentView] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserData()
    loadDarkMode()
    
    // Determinar view atual baseada na URL
    const path = pathname.split('/').pop()
    setCurrentView(path || 'dashboard')
  }, [pathname])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [darkMode])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      const [
        transactionsRes,
        categoriesRes,
        accountsRes,
        cardsRes
      ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('cards').select('*').eq('user_id', user.id)
      ])

      if (categoriesRes.data && categoriesRes.data.length === 0) {
        await initializeDefaultCategories()
      }

      setData({
        transactions: (transactionsRes.data as Transaction[]) || [],
        categories: {
          income: (categoriesRes.data as Category[])?.filter((c: Category) => c.type === 'income') || [],
          expense: (categoriesRes.data as Category[])?.filter((c: Category) => c.type === 'expense') || []
        },
        accounts: (accountsRes.data as Account[]) || [],
        cards: (cardsRes.data as Card[]) || []
      })
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeDefaultCategories = async () => {
    const defaultCategories = [
      { name: 'Salário', type: 'income', emoji: '💰', color: '#6366f1' },
      { name: 'Investimentos', type: 'income', emoji: '📈', color: '#10b981' },
      { name: 'Freelance', type: 'income', emoji: '💻', color: '#f59e0b' },
      { name: 'Alimentação', type: 'expense', emoji: '🍔', color: '#ef4444' },
      { name: 'Transporte', type: 'expense', emoji: '🚗', color: '#6366f1' },
      { name: 'Moradia', type: 'expense', emoji: '🏠', color: '#10b981' },
      { name: 'Lazer', type: 'expense', emoji: '🎬', color: '#f59e0b' },
      { name: 'Saúde', type: 'expense', emoji: '💊', color: '#8b5cf6' }
    ]

    const categoriesToInsert = defaultCategories.map(cat => ({
      ...cat,
      user_id: user.id
    }))

    await supabase.from('categories').insert(categoriesToInsert)
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
  }

  const navigate = (page: string) => {
    setCurrentView(page)
    setSidebarOpen(false)
    
    // Navegar para a página correspondente
    if (page === 'dashboard') {
      router.push('/dashboard')
    } else {
      router.push(`/dashboard/${page}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const checkSubscription = () => {
    if (!userData) return false
    
    const now = new Date()
    const endDate = userData.subscription_end_date ? new Date(userData.subscription_end_date) : null
    
    return userData.subscription_status === 'active' || 
           userData.subscription_status === 'trial' ||
           (endDate && endDate > now)
  }

  const needsSubscription = !checkSubscription()

  const renderPageContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />
      case 'transactions':
        return <TransactionsPage />
      case 'categories':
        return <CategoriesPage />
      case 'accounts':
        return <AccountsPage />
      case 'cards':
        return <CardsPage />
      case 'settings':
        return <SettingsPage />
      case 'simulator':
        return <SimulatorPage />
      default:
        return children
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (needsSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold mb-4">Assinatura Necessária</h2>
          <p className="text-gray-600 mb-6">
            Sua assinatura expirou. Para continuar usando o FinançasGO, 
            escolha um plano e reative sua conta.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ver Planos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <Sidebar 
          currentView={currentView}
          navigate={navigate}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div className="flex-1 lg:ml-64">
          <Header 
            user={user}
            userData={userData}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            setSidebarOpen={setSidebarOpen}
            onLogout={handleLogout}
          />
          
          <main className="p-6">
            {pathname === '/dashboard' ? renderPageContent() : children}
          </main>
        </div>
      </div>
      
      <NotificationSystem />
    </div>
  )
}
