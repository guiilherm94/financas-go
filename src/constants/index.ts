export const PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Plano Mensal',
    price: 4.90,
    interval: 'mês',
    description: 'Acesso completo a todas as funcionalidades',
    features: [
      'Controle completo de receitas e despesas',
      'Organização por categorias personalizáveis',
      'Múltiplas contas e cartões',
      'Relatórios e gráficos detalhados',
      'Exportação para PDF',
      'Suporte prioritário'
    ]
  },
  YEARLY: {
    id: 'yearly',
    name: 'Plano Anual',
    price: 39.90,
    interval: 'ano',
    description: 'Economia de 32% comparado ao plano mensal',
    monthlyEquivalent: 3.32,
    savings: 18.90,
    features: [
      'Controle completo de receitas e despesas',
      'Organização por categorias personalizáveis',
      'Múltiplas contas e cartões',
      'Relatórios e gráficos detalhados',
      'Exportação para PDF',
      'Suporte prioritário',
      '32% de desconto',
      'Sem preocupação com renovação mensal'
    ]
  }
} as const

export const TRIAL_DURATION_DAYS = 7

export const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  CARD: 'card'
} as const

export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  INVESTMENT: 'investment',
  CASH: 'cash'
} as const

export const ACCOUNT_TYPE_LABELS = {
  [ACCOUNT_TYPES.CHECKING]: 'Conta Corrente',
  [ACCOUNT_TYPES.SAVINGS]: 'Conta Poupança',
  [ACCOUNT_TYPES.INVESTMENT]: 'Investimentos',
  [ACCOUNT_TYPES.CASH]: 'Dinheiro'
} as const
export const RECURRING_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const

export const RECURRING_TYPE_LABELS = {
  [RECURRING_TYPES.DAILY]: 'Diário',
  [RECURRING_TYPES.WEEKLY]: 'Semanal',
  [RECURRING_TYPES.MONTHLY]: 'Mensal',
  [RECURRING_TYPES.YEARLY]: 'Anual'
} as const

export const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
] as const

export const DEFAULT_EMOJIS = {
  CATEGORIES: [
    '💰', '💵', '💳', '📈', '📉', '💹', '💸', '🏦', '🏠', '🏢', 
    '🔧', '🧹', '🛋️', '⚡', '💧', '🔥', '📶', '📱', '🚗', '🚕', 
    '🚌', '⛽', '🚲', '✈️', '🛒', '👕', '👞', '🧴', '🛍️', '🍔', 
    '🍝', '☕', '🍲', '🍺', '🎬', '🎮', '📚', '🎭', '🎵', '🏖️', 
    '💊', '🏥', '🦷', '👓', '🧠', '🏋️', '🧘', '🏃', '💆', '🥗', 
    '💼', '📊', '🖥️', '👔', '🎓', '🔬'
  ],
  ACCOUNTS: [
    '🏦', '💳', '💰', '💵', '💎', '🏛️', '💼', '🎯', '💸', '📊',
    '📈', '📉', '💹', '🪙', '💴', '💶', '💷', '🔒', '🗝️', '💯'
  ],
  CARDS: [
    '💳', '💎', '🏛️', '🌟', '⭐', '💰', '🔥', '⚡', '🚀', '💫',
    '🎯', '🏆', '👑', '💍', '🎪', '🎭', '🎨', '🎲', '🎊', '🎁'
  ]
} as const

export const DEFAULT_CATEGORIES = {
  INCOME: [
    { name: 'Salário', emoji: '💰', color: '#6366f1' },
    { name: 'Investimentos', emoji: '📈', color: '#10b981' },
    { name: 'Freelance', emoji: '💻', color: '#f59e0b' },
    { name: 'Vendas', emoji: '💵', color: '#8b5cf6' },
    { name: 'Bonus', emoji: '💸', color: '#ec4899' },
    { name: 'Aluguel', emoji: '🏠', color: '#6366f1' },
    { name: 'Dividendos', emoji: '📊', color: '#10b981' }
  ],
  EXPENSE: [
    { name: 'Alimentação', emoji: '🍔', color: '#ef4444' },
    { name: 'Transporte', emoji: '🚗', color: '#6366f1' },
    { name: 'Moradia', emoji: '🏠', color: '#10b981' },
    { name: 'Lazer', emoji: '🎬', color: '#f59e0b' },
    { name: 'Saúde', emoji: '💊', color: '#8b5cf6' },
    { name: 'Educação', emoji: '📚', color: '#ec4899' },
    { name: 'Vestuário', emoji: '👕', color: '#f97316' },
    { name: 'Tecnologia', emoji: '📱', color: '#06b6d4' }
  ]
} as const

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const

export const LOCAL_STORAGE_KEYS = {
  DARK_MODE: 'finance_darkmode',
  USER_PREFERENCES: 'finance_user_preferences',
  FILTERS: 'finance_filters',
  SORT_ORDER: 'finance_sort_order'
} as const

export const API_ENDPOINTS = {
  SUBSCRIPTION: {
    CREATE: '/api/subscription/create',
    CANCEL: '/api/subscription/cancel',
    STATUS: '/api/subscription/status'
  },
  WEBHOOK: '/api/webhook'
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Acesso não autorizado.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION: 'Dados inválidos fornecidos.',
  SUBSCRIPTION_EXPIRED: 'Sua assinatura expirou.',
  PAYMENT_FAILED: 'Falha no processamento do pagamento.'
} as const

export const SUCCESS_MESSAGES = {
  SAVED: 'Dados salvos com sucesso!',
  DELETED: 'Item excluído com sucesso!',
  UPDATED: 'Dados atualizados com sucesso!',
  EXPORTED: 'Dados exportados com sucesso!',
  IMPORTED: 'Dados importados com sucesso!',
  SUBSCRIPTION_CREATED: 'Assinatura criada com sucesso!',
  PAYMENT_CONFIRMED: 'Pagamento confirmado!'
} as const
