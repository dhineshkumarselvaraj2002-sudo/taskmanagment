"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  Check, 
  X, 
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  MessageSquare
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ExtendedNotification } from "@/types"
import Link from "next/link"

const notificationIcons = {
  TASK_ASSIGNED: User,
  TASK_UPDATED: AlertTriangle,
  TASK_COMPLETED: CheckCircle,
  TASK_COMMENTED: MessageSquare,
  DEADLINE_APPROACHING: Clock,
  DEADLINE_PASSED: AlertTriangle,
  STATUS_CHANGED: AlertTriangle,
  PRIORITY_CHANGED: AlertTriangle,
  USER_MENTIONED: User,
}

const notificationColors = {
  TASK_ASSIGNED: "text-blue-600 bg-blue-50",
  TASK_UPDATED: "text-yellow-600 bg-yellow-50",
  TASK_COMPLETED: "text-green-600 bg-green-50",
  TASK_COMMENTED: "text-purple-600 bg-purple-50",
  DEADLINE_APPROACHING: "text-orange-600 bg-orange-50",
  DEADLINE_PASSED: "text-red-600 bg-red-50",
  STATUS_CHANGED: "text-blue-600 bg-blue-50",
  PRIORITY_CHANGED: "text-yellow-600 bg-yellow-50",
  USER_MENTIONED: "text-purple-600 bg-purple-50",
}

interface NotificationDropdownProps {
  notifications: ExtendedNotification[]
  isLoading: boolean
  onClose: () => void
}

async function markAsRead(notificationIds: string[]) {
  const response = await fetch("/api/notifications", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "markAsRead",
      notificationIds,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to mark notifications as read")
  }

  return response.json()
}

async function markAllAsRead() {
  const response = await fetch("/api/notifications", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "markAllAsRead",
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read")
  }

  return response.json()
}

export function NotificationDropdown({ 
  notifications, 
  isLoading, 
  onClose 
}: NotificationDropdownProps) {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const queryClient = useQueryClient()

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
      setSelectedNotifications([])
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
    },
  })

  const handleMarkAsRead = () => {
    if (selectedNotifications.length > 0) {
      markAsReadMutation.mutate(selectedNotifications)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleNotificationClick = (notification: ExtendedNotification) => {
    if (notification.status === "UNREAD") {
      setSelectedNotifications(prev => [...prev, notification.id])
      markAsReadMutation.mutate([notification.id])
    }
  }

  const unreadCount = notifications.filter(n => n.status === "UNREAD").length

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <CardDescription>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell
                  const colorClass = notificationColors[notification.type as keyof typeof notificationColors] || "text-gray-600 bg-gray-50"

                  return (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notification.status === "UNREAD" ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {notification.status === "UNREAD" && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            {notification.task && (
                              <Link
                                href={`/admin/tasks/${notification.task.id}`}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View task
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/notifications">
                View all notifications
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
