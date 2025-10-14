"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { Loader2, AlertCircle, CheckCircle, Clock, User } from "lucide-react"

export default function UserTasksPage() {
  const queryClient = useQueryClient()

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["user-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await res.json()
      // Ensure we return an array
      return Array.isArray(data) ? data : (data.tasks || [])
    },
  })

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        throw new Error("Failed to update task")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">Manage your assigned tasks</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading tasks...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">Manage your assigned tasks</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load tasks. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Ensure tasks is an array
  const tasksArray = Array.isArray(tasks) ? tasks : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground">
          Manage your assigned tasks
        </p>
      </div>

      {tasksArray.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
          <p className="text-muted-foreground">
            You don't have any tasks assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasksArray.map((task: any) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{task.taskName}</CardTitle>
                    <CardDescription>{task.taskDescription}</CardDescription>
                  </div>
                  <Badge 
                    variant={
                      task.status === "COMPLETED" ? "default" :
                      task.status === "IN_PROGRESS" ? "secondary" :
                      task.status === "IN_REVIEW" ? "outline" :
                      "outline"
                    }
                    className="capitalize"
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.createdBy?.image} />
                      <AvatarFallback>
                        {task.createdBy?.name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        Created by {task.createdBy?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">Task creator</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Start: {format(new Date(task.startDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>End: {format(new Date(task.endDate), "MMM d, yyyy")}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"].map((status) => (
                      <Button
                        key={status}
                        variant={task.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTaskStatus.mutate({ id: task.id, status })}
                        disabled={updateTaskStatus.isPending}
                        className="capitalize"
                      >
                        {status.replace("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
