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
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/notifications?limit=20')
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
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
        return <User className="h-4 w-4 text-blue-500" />
      case 'TASK_UPDATED':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'TASK_COMPLETED':
        return <Check className="h-4 w-4 text-green-500" />
      case 'DEADLINE_APPROACHING':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'DEADLINE_PASSED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
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
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {notification.status === 'UNREAD' && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.task && (
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {formatDate(notification.task.endDate)}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              notification.task.priority === 'HIGH' || notification.task.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-800'
                                : notification.task.priority === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {notification.task.priority}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to full notifications page
                  window.location.href = '/admin/notifications'
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                View all notifications
              </button>
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
