import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error: any) {
      console.error(`Erro ao carregar localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error: any) {
      console.error(`Erro ao salvar localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const usePrevious = <T>(value: T): T | undefined => {
  const [current, setCurrent] = useState<T>(value)
  const [previous, setPrevious] = useState<T | undefined>(undefined)

  if (value !== current) {
    setPrevious(current)
    setCurrent(value)
  }

  return previous
}

export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = () => setValue(!value)
  const setTrue = () => setValue(true)
  const setFalse = () => setValue(false)

  return { value, toggle, setTrue, setFalse, setValue }
}

export const useAsync = <T, E = string>(asyncFunction: () => Promise<T>) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = async () => {
    setStatus('pending')
    setValue(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setValue(response)
      setStatus('success')
    } catch (error: any) {
      setError(error as E)
      setStatus('error')
    }
  }

  return { execute, status, value, error }
}

export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

export const useKeyPress = (targetKey: string, handler: () => void) => {
  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        handler()
      }
    }

    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [targetKey, handler])
}

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: userData } = await supabase
          .from('users')
          .select('subscription_status, subscription_plan, subscription_end_date')
          .eq('id', session.user.id)
          .single()

        setSubscriptionData(userData)
      } catch (error: any) {
        console.error('Erro ao carregar assinatura:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const isActive = subscriptionData?.subscription_status === 'active'
  const isTrial = subscriptionData?.subscription_status === 'trial'
  const isExpired = subscriptionData?.subscription_status === 'expired' || 
                   subscriptionData?.subscription_status === 'cancelled'

  return {
    subscription: subscriptionData,
    loading,
    isActive,
    isTrial,
    isExpired
  }
}

export const usePagination = <T>(items: T[], pageSize: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = items.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPreviousPage = () => goToPage(currentPage - 1)
  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  }
}
