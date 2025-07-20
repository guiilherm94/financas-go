export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR')
}

export const formatDatetime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('pt-BR')
}

export const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}

export const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[month] || 'Mês inválido'
}

export const getMonthAbbreviation = (month: number): string => {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
  return months[month] || 'Inv'
}

export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const classNames = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-BR').format(num)
}

export const parseNumber = (str: string): number => {
  return parseFloat(str.replace(/[^\d,-]/g, '').replace(',', '.'))
}

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate
}

export const getDateRange = (period: 'week' | 'month' | 'year', date: Date = new Date()) => {
  const start = new Date(date)
  const end = new Date(date)

  switch (period) {
    case 'week':
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      end.setDate(start.getDate() + 6)
      break
    case 'month':
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
      break
    case 'year':
      start.setMonth(0, 1)
      end.setMonth(11, 31)
      break
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export const calculateCompoundInterest = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): { finalAmount: number; totalContributions: number; totalInterest: number } => {
  const monthlyRate = annualRate / 100 / 12
  const months = years * 12
  
  if (monthlyRate === 0) {
    const finalAmount = principal + (monthlyContribution * months)
    return {
      finalAmount,
      totalContributions: principal + (monthlyContribution * months),
      totalInterest: 0
    }
  }

  const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, months)
  const futureValueContributions = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  
  const finalAmount = futureValuePrincipal + futureValueContributions
  const totalContributions = principal + (monthlyContribution * months)
  const totalInterest = finalAmount - totalContributions

  return {
    finalAmount,
    totalContributions,
    totalInterest
  }
}

export const calculateLoanPayment = (
  principal: number,
  annualRate: number,
  years: number
): { monthlyPayment: number; totalPayment: number; totalInterest: number } => {
  const monthlyRate = annualRate / 100 / 12
  const months = years * 12

  if (monthlyRate === 0) {
    const monthlyPayment = principal / months
    return {
      monthlyPayment,
      totalPayment: principal,
      totalInterest: 0
    }
  }

  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
    (Math.pow(1 + monthlyRate, months) - 1)
  
  const totalPayment = monthlyPayment * months
  const totalInterest = totalPayment - principal

  return {
    monthlyPayment,
    totalPayment,
    totalInterest
  }
}

export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(10))) return false

  return true
}

export const formatCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, '')
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export const formatPhone = (phone: string): string => {
  phone = phone.replace(/[^\d]/g, '')
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export const getSubscriptionStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100'
    case 'trial':
      return 'text-yellow-600 bg-yellow-100'
    case 'cancelled':
    case 'expired':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const downloadFile = (data: any, filename: string, type: string = 'application/json'): void => {
  const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error: any) {
    console.error('Erro ao copiar para clipboard:', error)
    return false
  }
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
