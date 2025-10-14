"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function UserNotificationsPage() {
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications")
      return res.json()
    },
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "READ" }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications?.filter((n: any) => n.status === "UNREAD") || []
      await Promise.all(
        unreadNotifications.map((notification: any) =>
          fetch(`/api/notifications/${notification.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "READ" }),
          })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const unreadCount = notifications?.filter((n: any) => n.status === "UNREAD").length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount} unread notifications
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications?.map((notification: any) => (
          <Card key={notification.id} className={notification.status === "UNREAD" ? "border-l-4 border-l-blue-500" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {notification.status === "UNREAD" && (
                      <Badge variant="secondary">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                
                {notification.status === "UNREAD" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead.mutate(notification.id)}
                    disabled={markAsRead.isPending}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {notifications?.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
