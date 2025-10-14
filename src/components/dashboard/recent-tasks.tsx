"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, User, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
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

export function RecentTasks() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <RecentTasksSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Latest tasks created in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to load recent tasks
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats?.recentTasks) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>Latest tasks created in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.recentTasks.map((task: ExtendedTask) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignedTo?.image || ""} />
                  <AvatarFallback>
                    {task.assignedTo?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
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
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/tasks/${task.id}`}>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/admin/tasks">
              View All Tasks
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentTasksSkeleton() {
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
