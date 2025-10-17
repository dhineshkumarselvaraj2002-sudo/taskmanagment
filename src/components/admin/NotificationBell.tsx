'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Clock, User, Calendar } from 'lucide-react'
import { ExtendedNotification } from '@/types'

interface NotificationBellProps {
  userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    
    // Set up polling to check for new notifications every 3 seconds for better responsiveness
    const interval = setInterval(() => {
      fetchNotifications()
    }, 3000) // 3 seconds for better real-time experience
    
    return () => clearInterval(interval)
  }, [userId])

  // Listen for custom events to refresh notifications immediately
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout

    const handleNotificationRefresh = () => {
      console.log('NotificationBell - Event triggered, refreshing notifications...')
      // Debounce the refresh to prevent too many API calls
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      refreshTimeout = setTimeout(() => {
        fetchNotifications()
      }, 500) // 500ms debounce
    }

    // Listen for task-related events that should trigger notification refresh
    window.addEventListener('taskCreated', handleNotificationRefresh)
    window.addEventListener('taskUpdated', handleNotificationRefresh)
    window.addEventListener('taskDeleted', handleNotificationRefresh)
    window.addEventListener('taskStatusChanged', handleNotificationRefresh)
    window.addEventListener('notificationRefresh', handleNotificationRefresh)

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      window.removeEventListener('taskCreated', handleNotificationRefresh)
      window.removeEventListener('taskUpdated', handleNotificationRefresh)
      window.removeEventListener('taskDeleted', handleNotificationRefresh)
      window.removeEventListener('taskStatusChanged', handleNotificationRefresh)
      window.removeEventListener('notificationRefresh', handleNotificationRefresh)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.notification-dropdown')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      console.log('NotificationBell - Fetching notifications for user:', userId)
      const response = await fetch('/api/user/notifications?limit=20')
      const data = await response.json()
      
      console.log('NotificationBell - API response:', data)
      
      if (data.success) {
        setNotifications(data.data)
        setUnreadCount(data.unreadCount)
        console.log('NotificationBell - Notifications set:', data.data.length, 'Unread:', data.unreadCount)
      } else {
        console.error('NotificationBell - API error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchNotifications()
  }

  // Add a more aggressive refresh mechanism for better real-time experience
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications()
      }
    }

    const handleFocus = () => {
      fetchNotifications()
    }

    // Refresh notifications when user returns to the tab
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          status: 'READ'
        })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id)
              ? { ...notification, status: 'READ' }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications
      .filter(n => n.status === 'UNREAD')
      .map(n => n.id)
    
    if (unreadNotifications.length > 0) {
      await markAsRead(unreadNotifications)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <User className="h-3 w-3 text-white dark:text-gray-800" />
      case 'TASK_UPDATED':
        return <AlertCircle className="h-3 w-3 text-white dark:text-gray-800" />
      case 'TASK_COMPLETED':
        return <Check className="h-3 w-3 text-white dark:text-gray-800" />
      case 'DEADLINE_APPROACHING':
        return <Clock className="h-3 w-3 text-white dark:text-gray-800" />
      case 'DEADLINE_PASSED':
        return <AlertCircle className="h-3 w-3 text-white dark:text-gray-800" />
      default:
        return <Bell className="h-3 w-3 text-white dark:text-gray-800" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleNotificationClick = (notification: ExtendedNotification) => {
    if (notification.status === 'UNREAD') {
      markAsRead([notification.id])
    }
    
    // If it's a task notification, you could navigate to the task
    if (notification.taskId) {
      // Navigate to task details or open task modal
      console.log('Navigate to task:', notification.taskId)
    }
  }

  return (
    <div className="relative notification-dropdown">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg focus:outline-none"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Notification Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 notification-dropdown">
          {/* Compact Header */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">({unreadCount})</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleRefresh}
                className="p-1 text-gray-500 dark:text-gray-400 rounded"
                title="Refresh"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  Mark all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 dark:text-gray-400 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Compact Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Bell className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  No notifications
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 cursor-pointer ${
                      notification.status === 'UNREAD' 
                        ? 'bg-gray-50 dark:bg-gray-700 border-l-2 border-black dark:border-white' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${
                          notification.status === 'UNREAD' 
                            ? 'bg-black dark:bg-white' 
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {notification.status === 'UNREAD' && (
                            <div className="flex-shrink-0 ml-1">
                              <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(notification.createdAt)}
                          </p>
                          {notification.status === 'UNREAD' && (
                            <span className="text-xs font-medium text-black dark:text-white">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compact Footer */}
          {notifications.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // Navigate to notifications page
                    window.location.href = '/admin/notifications'
                  }}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  <span>View all</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
