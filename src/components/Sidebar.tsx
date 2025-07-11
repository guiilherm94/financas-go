'use client'

import { Wallet, BarChart3, ArrowRightLeft, Tags, Building2, CreditCard, Calculator, Settings, Menu, X } from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'transactions', label: 'Transações', icon: ArrowRightLeft },
  { id: 'categories', label: 'Categorias', icon: Tags },
  { id: 'accounts', label: 'Contas', icon: Building2 },
  { id: 'cards', label: 'Cartões', icon: CreditCard },
  { id: 'simulator', label: 'Simulador', icon: Calculator },
  { id: 'settings', label: 'Configurações', icon: Settings },
]

export default function Sidebar({ 
  currentView, 
  navigate, 
  sidebarOpen, 
  setSidebarOpen 
}: {
  currentView: string
  navigate: (page: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity z-20 lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      <div className={`
        fixed top-0 left-0 z-30 w-64 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Wallet className="w-8 h-8 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">FinançasGO</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}
