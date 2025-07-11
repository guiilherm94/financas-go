'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, PiggyBank, Target, DollarSign, Calendar } from 'lucide-react'

export default function SimulatorPage() {
  const [activeSimulator, setActiveSimulator] = useState('investment')
  
  const [investmentData, setInvestmentData] = useState({
    initialAmount: '',
    monthlyAmount: '',
    annualRate: '',
    period: ''
  })

  const [financingData, setFinancingData] = useState({
    amount: '',
    downPayment: '',
    annualRate: '',
    period: ''
  })

  const [retirementData, setRetirementData] = useState({
    currentAge: '',
    retirementAge: '',
    monthlyExpenses: '',
    currentSavings: '',
    monthlyContribution: '',
    expectedReturn: ''
  })

  const [goalData, setGoalData] = useState({
    goalAmount: '',
    currentAmount: '',
    monthlyContribution: '',
    expectedReturn: '',
    timeFrame: ''
  })

  const simulators = [
    { 
      id: 'investment', 
      label: 'Investimentos', 
      icon: TrendingUp,
      description: 'Simule o crescimento dos seus investimentos'
    },
    { 
      id: 'financing', 
      label: 'Financiamentos', 
      icon: Calculator,
      description: 'Calcule prestações de financiamentos'
    },
    { 
      id: 'retirement', 
      label: 'Aposentadoria', 
      icon: PiggyBank,
      description: 'Planeje sua aposentadoria'
    },
    { 
      id: 'goal', 
      label: 'Metas', 
      icon: Target,
      description: 'Calcule tempo para atingir suas metas'
    }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const calculateInvestment = () => {
    const initial = parseFloat(investmentData.initialAmount) || 0
    const monthly = parseFloat(investmentData.monthlyAmount) || 0
    const rate = parseFloat(investmentData.annualRate) / 100 / 12
    const periods = parseInt(investmentData.period) * 12

    if (rate === 0) {
      const finalAmount = initial + (monthly * periods)
      return {
        finalAmount,
        totalInvested: initial + (monthly * periods),
        totalInterest: 0
      }
    }

    // Valor futuro do montante inicial
    const futureValueInitial = initial * Math.pow(1 + rate, periods)
    
    // Valor futuro das contribuições mensais
    const futureValueMonthly = monthly * ((Math.pow(1 + rate, periods) - 1) / rate)
    
    const finalAmount = futureValueInitial + futureValueMonthly
    const totalInvested = initial + (monthly * periods)
    const totalInterest = finalAmount - totalInvested

    return {
      finalAmount,
      totalInvested,
      totalInterest
    }
  }

  const calculateFinancing = () => {
    const amount = parseFloat(financingData.amount) || 0
    const downPayment = parseFloat(financingData.downPayment) || 0
    const rate = parseFloat(financingData.annualRate) / 100 / 12
    const periods = parseInt(financingData.period) * 12

    const financedAmount = amount - downPayment

    if (rate === 0) {
      const monthlyPayment = financedAmount / periods
      return {
        monthlyPayment,
        totalPaid: financedAmount,
        totalInterest: 0,
        financedAmount
      }
    }

    const monthlyPayment = financedAmount * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1)
    const totalPaid = monthlyPayment * periods
    const totalInterest = totalPaid - financedAmount

    return {
      monthlyPayment,
      totalPaid,
      totalInterest,
      financedAmount
    }
  }

  const calculateRetirement = () => {
    const currentAge = parseInt(retirementData.currentAge) || 0
    const retirementAge = parseInt(retirementData.retirementAge) || 65
    const monthlyExpenses = parseFloat(retirementData.monthlyExpenses) || 0
    const currentSavings = parseFloat(retirementData.currentSavings) || 0
    const monthlyContribution = parseFloat(retirementData.monthlyContribution) || 0
    const expectedReturn = parseFloat(retirementData.expectedReturn) / 100 / 12

    const yearsToRetire = retirementAge - currentAge
    const monthsToRetire = yearsToRetire * 12

    // Valor acumulado até a aposentadoria
    const futureValueCurrent = currentSavings * Math.pow(1 + expectedReturn, monthsToRetire)
    const futureValueContributions = monthlyContribution * ((Math.pow(1 + expectedReturn, monthsToRetire) - 1) / expectedReturn)
    const totalAtRetirement = futureValueCurrent + futureValueContributions

    // Estimativa de duração da reserva (assumindo 25 anos de aposentadoria)
    const retirementYears = 25
    const monthlyWithdrawal = totalAtRetirement * expectedReturn / (1 - Math.pow(1 + expectedReturn, -retirementYears * 12))

    return {
      totalAtRetirement,
      monthlyWithdrawal,
      monthlyExpenses,
      surplus: monthlyWithdrawal - monthlyExpenses,
      yearsToRetire
    }
  }

  const calculateGoal = () => {
    const goalAmount = parseFloat(goalData.goalAmount) || 0
    const currentAmount = parseFloat(goalData.currentAmount) || 0
    const monthlyContribution = parseFloat(goalData.monthlyContribution) || 0
    const rate = parseFloat(goalData.expectedReturn) / 100 / 12
    const timeFrame = parseInt(goalData.timeFrame) || 0

    const remainingAmount = goalAmount - currentAmount

    if (monthlyContribution === 0) {
      return {
        monthsNeeded: Infinity,
        yearsNeeded: Infinity,
        finalAmount: currentAmount * Math.pow(1 + rate, timeFrame * 12),
        shortfall: 0
      }
    }

    // Calcular quantos meses são necessários
    if (rate === 0) {
      const monthsNeeded = remainingAmount / monthlyContribution
      return {
        monthsNeeded,
        yearsNeeded: monthsNeeded / 12,
        finalAmount: goalAmount,
        shortfall: 0
      }
    }

    // Valor futuro em X anos
    const futureValueCurrent = currentAmount * Math.pow(1 + rate, timeFrame * 12)
    const futureValueContributions = monthlyContribution * ((Math.pow(1 + rate, timeFrame * 12) - 1) / rate)
    const finalAmount = futureValueCurrent + futureValueContributions

    const shortfall = Math.max(0, goalAmount - finalAmount)

    // Calcular meses necessários para atingir a meta
    let monthsNeeded = 0
    if (remainingAmount > 0 && rate > 0) {
      monthsNeeded = Math.log(1 + (remainingAmount * rate) / monthlyContribution) / Math.log(1 + rate)
    }

    return {
      monthsNeeded: isFinite(monthsNeeded) ? monthsNeeded : 0,
      yearsNeeded: isFinite(monthsNeeded) ? monthsNeeded / 12 : 0,
      finalAmount,
      shortfall
    }
  }

  const renderInvestmentSimulator = () => {
    const results = calculateInvestment()

    return (
      <div className="space-y-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Inicial (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={investmentData.initialAmount}
              onChange={(e) => setInvestmentData({ ...investmentData, initialAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aporte Mensal (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={investmentData.monthlyAmount}
              onChange={(e) => setInvestmentData({ ...investmentData, monthlyAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taxa Anual (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={investmentData.annualRate}
              onChange={(e) => setInvestmentData({ ...investmentData, annualRate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Período (anos)
            </label>
            <input
              type="number"
              min="1"
              value={investmentData.period}
              onChange={(e) => setInvestmentData({ ...investmentData, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="10"
            />
          </div>
        </form>

        {(investmentData.initialAmount || investmentData.monthlyAmount) && investmentData.annualRate && investmentData.period && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resultados da Simulação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor Final</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(results.finalAmount)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Investido</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(results.totalInvested)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Juros Ganhos</p>
                <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                  {formatCurrency(results.totalInterest)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderFinancingSimulator = () => {
    const results = calculateFinancing()

    return (
      <div className="space-y-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor do Bem (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={financingData.amount}
              onChange={(e) => setFinancingData({ ...financingData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="200000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entrada (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={financingData.downPayment}
              onChange={(e) => setFinancingData({ ...financingData, downPayment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="40000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taxa Anual (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={financingData.annualRate}
              onChange={(e) => setFinancingData({ ...financingData, annualRate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="8.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prazo (anos)
            </label>
            <input
              type="number"
              min="1"
              value={financingData.period}
              onChange={(e) => setFinancingData({ ...financingData, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="20"
            />
          </div>
        </form>

        {financingData.amount && financingData.annualRate && financingData.period && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resultados do Financiamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor Financiado</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(results.financedAmount)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Prestação Mensal</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(results.monthlyPayment)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Pago</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(results.totalPaid)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Juros</p>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {formatCurrency(results.totalInterest)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderRetirementSimulator = () => {
    const results = calculateRetirement()

    return (
      <div className="space-y-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idade Atual
            </label>
            <input
              type="number"
              min="18"
              max="100"
              value={retirementData.currentAge}
              onChange={(e) => setRetirementData({ ...retirementData, currentAge: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idade para Aposentar
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={retirementData.retirementAge}
              onChange={(e) => setRetirementData({ ...retirementData, retirementAge: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="65"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gastos Mensais Desejados (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={retirementData.monthlyExpenses}
              onChange={(e) => setRetirementData({ ...retirementData, monthlyExpenses: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reserva Atual (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={retirementData.currentSavings}
              onChange={(e) => setRetirementData({ ...retirementData, currentSavings: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contribuição Mensal (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={retirementData.monthlyContribution}
              onChange={(e) => setRetirementData({ ...retirementData, monthlyContribution: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retorno Esperado Anual (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={retirementData.expectedReturn}
              onChange={(e) => setRetirementData({ ...retirementData, expectedReturn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="10"
            />
          </div>
        </form>

        {retirementData.currentAge && retirementData.retirementAge && retirementData.expectedReturn && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Projeção de Aposentadoria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reserva na Aposentadoria</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(results.totalAtRetirement)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Renda Mensal Possível</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(results.monthlyWithdrawal)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Anos até Aposentar</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {results.yearsToRetire}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {results.surplus >= 0 ? 'Sobra Mensal' : 'Déficit Mensal'}
                </p>
                <p className={`text-xl font-bold ${
                  results.surplus >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(Math.abs(results.surplus))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderGoalSimulator = () => {
    const results = calculateGoal()

    return (
      <div className="space-y-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor da Meta (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={goalData.goalAmount}
              onChange={(e) => setGoalData({ ...goalData, goalAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Atual (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={goalData.currentAmount}
              onChange={(e) => setGoalData({ ...goalData, currentAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contribuição Mensal (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={goalData.monthlyContribution}
              onChange={(e) => setGoalData({ ...goalData, monthlyContribution: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retorno Esperado Anual (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={goalData.expectedReturn}
              onChange={(e) => setGoalData({ ...goalData, expectedReturn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="12"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prazo Desejado (anos)
            </label>
            <input
              type="number"
              min="0"
              value={goalData.timeFrame}
              onChange={(e) => setGoalData({ ...goalData, timeFrame: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="5"
            />
          </div>
        </form>

        {goalData.goalAmount && goalData.monthlyContribution && goalData.expectedReturn && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Projeção da Meta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Tempo Necessário</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {isFinite(results.yearsNeeded) ? `${results.yearsNeeded.toFixed(1)} anos` : 'Impossível'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Valor em {goalData.timeFrame || 0} anos
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(results.finalAmount)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {results.shortfall > 0 ? 'Déficit' : 'Meta Atingida'}
                </p>
                <p className={`text-xl font-bold ${
                  results.shortfall > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {results.shortfall > 0 ? formatCurrency(results.shortfall) : '✓ Sucesso'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Progresso Atual</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((parseFloat(goalData.currentAmount) || 0) / (parseFloat(goalData.goalAmount) || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {(((parseFloat(goalData.currentAmount) || 0) / (parseFloat(goalData.goalAmount) || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const getCurrentSimulator = () => {
    switch (activeSimulator) {
      case 'investment':
        return renderInvestmentSimulator()
      case 'financing':
        return renderFinancingSimulator()
      case 'retirement':
        return renderRetirementSimulator()
      case 'goal':
        return renderGoalSimulator()
      default:
        return renderInvestmentSimulator()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Simulador Financeiro
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {simulators.map((simulator) => {
              const Icon = simulator.icon
              return (
                <button
                  key={simulator.id}
                  onClick={() => setActiveSimulator(simulator.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeSimulator === simulator.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {simulator.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {simulators.find(s => s.id === activeSimulator)?.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {simulators.find(s => s.id === activeSimulator)?.description}
            </p>
          </div>

          {getCurrentSimulator()}
        </div>
      </div>
    </div>
  )
}
