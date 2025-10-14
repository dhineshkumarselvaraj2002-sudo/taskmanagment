"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity, Clock, User, Plus, Edit, Trash2, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ActivityLogEntry } from "@/types"

async function fetchActivityLogs(): Promise<ActivityLogEntry[]> {
  const response = await fetch("/api/activity-logs")
  if (!response.ok) {
    throw new Error("Failed to fetch activity logs")
  }
  const data = await response.json()
  return data.data || []
}

const actionIcons = {
  TASK_CREATED: Plus,
  TASK_UPDATED: Edit,
  TASK_DELETED: Trash2,
  TASK_COMPLETED: CheckCircle,
  USER_CREATED: User,
  USER_UPDATED: Edit,
  USER_DELETED: Trash2,
}

const actionColors = {
  TASK_CREATED: "text-green-600 bg-green-50",
  TASK_UPDATED: "text-blue-600 bg-blue-50",
  TASK_DELETED: "text-red-600 bg-red-50",
  TASK_COMPLETED: "text-green-600 bg-green-50",
  USER_CREATED: "text-green-600 bg-green-50",
  USER_UPDATED: "text-blue-600 bg-blue-50",
  USER_DELETED: "text-red-600 bg-red-50",
}

export function ActivityTimeline() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: fetchActivityLogs,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <ActivitySkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest activities in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to load activity logs
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest activities in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No recent activity
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest activities in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 10).map((activity, index) => {
            const ActionIcon = actionIcons[activity.action as keyof typeof actionIcons] || Activity
            const actionColor = actionColors[activity.action as keyof typeof actionColors] || "text-gray-600 bg-gray-50"

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${actionColor}`}>
                  <ActionIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user?.image || ""} />
                      <AvatarFallback className="text-xs">
                        {activity.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">
                      {activity.user?.name || "Unknown User"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.action.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.action.replace("_", " ").toLowerCase()} {activity.entityType.toLowerCase()}
                    {activity.task && `: ${activity.task.taskName}`}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
