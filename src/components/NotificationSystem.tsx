'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (
    title: string, 
    message: string, 
    type: NotificationType = 'info', 
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification = { id, title, message, type, duration }
    
    setNotifications(prev => [...prev, notification])
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    window.showNotification = addNotification
    return () => {
      delete window.showNotification
    }
  }, [])

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900'
      case 'error':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900'
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900'
      case 'info':
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ${getStyles(notification.type)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

declare global {
  interface Window {
    showNotification?: (title: string, message: string, type?: NotificationType, duration?: number) => void
  }
}
