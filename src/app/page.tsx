'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="text-4xl mr-3">💰</div>
            <h1 className="text-4xl font-bold text-gray-900">FinançasGO</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Controle suas finanças de forma simples e intuitiva. 
            Organize receitas, despesas e acompanhe seus investimentos.
          </p>
        </header>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Escolha seu plano
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Mensal</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  R$ 4,90
                  <span className="text-lg font-normal text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600">Acesso completo a todas as funcionalidades</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Controle completo de receitas e despesas',
                  'Organização por categorias personalizáveis',
                  'Múltiplas contas e cartões',
                  'Relatórios e gráficos detalhados',
                  'Exportação para PDF',
                  'Suporte prioritário'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth?plan=monthly"
                className="w-full bg-indigo-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors block"
              >
                Começar Agora
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-200 hover:shadow-2xl transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Anual</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  R$ 39,90
                  <span className="text-lg font-normal text-gray-500">/ano</span>
                </div>
                <p className="text-green-600 font-semibold">Economize R$ 18,90 por ano!</p>
                <p className="text-gray-600">Equivale a R$ 3,32/mês</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Controle completo de receitas e despesas',
                  'Organização por categorias personalizáveis',
                  'Múltiplas contas e cartões',
                  'Relatórios e gráficos detalhados',
                  'Exportação para PDF',
                  'Suporte prioritário',
                  '32% de desconto',
                  'Sem preocupação com renovação mensal'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth?plan=yearly"
                className="w-full bg-indigo-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors block"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Já tem uma conta?
          </p>
          <Link
            href="/auth"
            className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  )
}
