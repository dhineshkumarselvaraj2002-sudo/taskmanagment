"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  User,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns"
import { ExtendedTask } from "@/types"
import Link from "next/link"

async function fetchTasks() {
  const response = await fetch("/api/tasks")
  if (!response.ok) {
    throw new Error("Failed to fetch tasks")
  }
  const data = await response.json()
  return data.data || []
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

export function TaskList() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <TaskListSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">Failed to load tasks</div>
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-sm">Get started by creating your first task.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task: ExtendedTask) => {
        const isOverdue = isBefore(new Date(task.endDate), new Date())
        const isDueSoon = isAfter(new Date(task.endDate), new Date()) && isBefore(new Date(task.endDate), addDays(new Date(), 3))

        return (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Task Status Indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === "COMPLETED" ? "bg-green-500" :
                      task.status === "IN_PROGRESS" ? "bg-blue-500" :
                      task.status === "IN_REVIEW" ? "bg-yellow-500" :
                      task.status === "BLOCKED" ? "bg-purple-500" :
                      "bg-gray-500"
                    }`} />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {task.taskName}
                      </h3>
                      {isOverdue && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {isDueSoon && !isOverdue && (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {task.taskDescription}
                    </p>

                    {/* Task Meta */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{task.assignedTo?.name || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(task.endDate), { addSuffix: true })}
                        </span>
                      </div>
                      {task.estimatedHours && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{task.estimatedHours}h estimated</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center space-x-2">
                  {/* Status and Priority Badges */}
                  <div className="flex flex-col space-y-1">
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

                  {/* Assigned User Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.assignedTo?.image || ""} />
                    <AvatarFallback className="text-xs">
                      {task.assignedTo?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/tasks/${task.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/tasks/${task.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Task
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                  <div className="flex space-x-4">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
