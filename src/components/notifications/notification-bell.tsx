"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { NotificationDropdown } from "./notification-dropdown"

async function fetchNotifications() {
  const response = await fetch("/api/notifications?limit=5")
  if (!response.ok) {
    throw new Error("Failed to fetch notifications")
  }
  const data = await response.json()
  return data.data || []
}

async function fetchUnreadCount() {
  const response = await fetch("/api/notifications?status=UNREAD")
  if (!response.ok) {
    throw new Error("Failed to fetch unread count")
  }
  const data = await response.json()
  return data.pagination?.total || 0
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000,
  })

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-8 w-8 rounded-full"
      >
        <Bell className="h-4 w-4" />
        {unreadCount && unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <NotificationDropdown 
          notifications={notifications || []}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}