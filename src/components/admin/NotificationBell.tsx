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
    // Only fetch notifications when component mounts
    fetchNotifications(true)
  }, [userId])

  // Set up real-time notification stream
  useEffect(() => {
    let eventSource: EventSource | null = null

    const setupEventSource = () => {
      try {
        eventSource = new EventSource('/api/notifications/stream')
        
        eventSource.onopen = () => {
          console.log('NotificationBell - Real-time connection established')
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('NotificationBell - Real-time notification received:', data)
            
            if (data.type === 'notification' && data.data) {
              // Add new notification to the list
              setNotifications(prev => [data.data, ...prev])
              setUnreadCount(prev => prev + 1)
              
              // Show browser notification if permission is granted
              if (Notification.permission === 'granted') {
                new Notification(data.data.title, {
                  body: data.data.message,
                  icon: '/favicon.ico'
                })
              }
            }
          } catch (error) {
            console.error('Error parsing real-time notification:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('NotificationBell - Real-time connection error:', error)
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSource) {
              eventSource.close()
              setupEventSource()
            }
          }, 5000)
        }
      } catch (error) {
        console.error('Failed to setup real-time notifications:', error)
      }
    }

    setupEventSource()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  // Listen for custom events to refresh notifications only when explicitly triggered
  useEffect(() => {
    const handleNotificationRefresh = () => {
      console.log('NotificationBell - Manual refresh triggered')
      fetchNotifications(true) // Only refresh when explicitly requested
    }

    // Listen for explicit notification refresh events
    window.addEventListener('notificationRefresh', handleNotificationRefresh)

    return () => {
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

  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      console.log('NotificationBell - Manual API call for user:', userId)
      const response = await fetch('/api/user/notifications?limit=20')
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data)
        setUnreadCount(data.unreadCount)
        console.log('NotificationBell - Notifications updated:', data.data.length, 'Unread:', data.unreadCount)
      } else {
        console.error('NotificationBell - API error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const handleRefresh = () => {
    console.log('NotificationBell - Manual refresh button clicked')
    fetchNotifications(true)
  }

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen)
  }


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

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
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
        onClick={handleDropdownToggle}
        className="relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 hover:bg-stone-200 dark:hover:bg-gray-700"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Notification Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 md:w-80 lg:w-80 xl:w-96 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 notification-dropdown transform transition-all duration-200 ease-out">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pt-3">Notifications</p>
                
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button
                  onClick={handleRefresh}
                  className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-stone-200 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
                  title="Refresh"
                >
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-stone-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors touch-manipulation"
                  >
                    <span className="hidden sm:inline">Mark all</span>
                    <span className="sm:hidden">All</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-stone-200 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
                <Bell className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-3" />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                  You'll see updates here when they arrive
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer transition-colors hover:bg-stone-200 dark:hover:bg-gray-700 touch-manipulation ${
                      notification.status === 'UNREAD' 
                        ? 'bg-stone-200 dark:bg-gray-700 border-l-4 border-black dark:border-white' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                          notification.status === 'UNREAD' 
                            ? 'bg-black dark:bg-white' 
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          {notification.status === 'UNREAD' && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.createdAt)}
                          </p>
                          {notification.status === 'UNREAD' && (
                          <span className="px-1.5 py-0.5 text-xs font-medium text-white bg-black dark:bg-white dark:text-black rounded-full flex-shrink-0">
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

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-stone-200 dark:bg-gray-700 rounded-b-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-0">
                  <span className="truncate">
                    {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // Navigate to notifications page
                    window.location.href = '/admin/notifications'
                  }}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors touch-manipulation flex-shrink-0"
                >
                  {/* <span className="hidden sm:inline">View all</span>
                  <span className="sm:hidden">All</span>
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg> */}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 sm:bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
