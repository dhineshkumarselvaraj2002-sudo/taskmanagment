"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, AlertTriangle, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns"
import { ExtendedTask } from "@/types"

async function fetchDashboardStats() {
  const response = await fetch("/api/dashboard/stats")
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }
  const data = await response.json()
  return data.data
}

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  BLOCKED: "bg-purple-100 text-purple-800",
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
}

export function UpcomingDeadlines() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <DeadlinesSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Tasks with deadlines in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to load upcoming deadlines
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats?.upcomingDeadlines) {
    return null
  }

  const getDeadlineStatus = (endDate: Date) => {
    const now = new Date()
    const isOverdue = isBefore(endDate, now)
    const isDueToday = isAfter(endDate, now) && isBefore(endDate, addDays(now, 1))
    const isDueSoon = isAfter(endDate, now) && isBefore(endDate, addDays(now, 3))

    if (isOverdue) return { status: "overdue", color: "text-red-600", icon: AlertTriangle }
    if (isDueToday) return { status: "due-today", color: "text-orange-600", icon: AlertTriangle }
    if (isDueSoon) return { status: "due-soon", color: "text-yellow-600", icon: Clock }
    return { status: "upcoming", color: "text-gray-600", icon: Calendar }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>Tasks with deadlines in the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.upcomingDeadlines.map((task: ExtendedTask) => {
            const deadlineStatus = getDeadlineStatus(new Date(task.endDate))
            const StatusIcon = deadlineStatus.icon

            return (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`p-2 rounded-full ${deadlineStatus.color.includes('red') ? 'bg-red-50' : deadlineStatus.color.includes('orange') ? 'bg-orange-50' : deadlineStatus.color.includes('yellow') ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                    <StatusIcon className={`h-4 w-4 ${deadlineStatus.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.taskName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${statusColors[task.status as keyof typeof statusColors]}`}
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={task.assignedTo?.image || ""} />
                        <AvatarFallback className="text-xs">
                          {task.assignedTo?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">
                        {task.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className={deadlineStatus.color}>
                    {formatDistanceToNow(new Date(task.endDate), { addSuffix: true })}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/tasks/${task.id}`}>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/admin/calendar">
              View Calendar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DeadlinesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="flex space-x-2">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
