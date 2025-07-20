'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SubscriptionExpiredPage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
      }
    }
    checkUser()
  }, [router])

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
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error)
      alert('Erro ao processar assinatura. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 mx-4">
        <div className="text-center">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Assinatura Expirada
          </h1>
          <p className="text-gray-600 mb-8">
            Sua assinatura expirou. Para continuar usando o FinançasGO, 
            escolha um dos planos abaixo e reative sua conta.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">Plano Mensal</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">R$ 4,90</div>
                <div className="text-sm text-gray-500">/mês</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Acesso completo a todas as funcionalidades
            </p>
            <button
              onClick={() => createSubscription('monthly')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Renovar Mensal
            </button>
          </div>

          <div className="border-2 border-indigo-200 rounded-lg p-4 relative hover:shadow-md transition-shadow">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                Mais Econômico
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">Plano Anual</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">R$ 39,90</div>
                <div className="text-sm text-gray-500">/ano</div>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium mb-1">
              Economize R$ 18,90 por ano!
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Equivale a apenas R$ 3,32/mês
            </p>
            <button
              onClick={() => createSubscription('yearly')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Renovar Anual
            </button>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">
            Após o pagamento, sua conta será reativada automaticamente
          </p>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
