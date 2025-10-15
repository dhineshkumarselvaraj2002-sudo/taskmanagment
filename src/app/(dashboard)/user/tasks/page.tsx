"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Plus, 
  Filter, 
  SortAsc, 
  Calendar,
  Target,
  Activity,
  Users,
  BarChart3,
  Settings,
  X,
  Edit,
  Trash2,
  Eye
} from "lucide-react"

export default function UserTasksPage() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({
    taskName: '',
    taskDescription: '',
    techStack: '',
    startDate: '',
    endDate: '',
    priority: 'Medium'
  })
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  // Sample users for assignment (in a real app, this would come from API)
  const availableUsers = [
    { id: '1', name: 'John Doe', email: 'john.doe@company.com' },
    { id: '2', name: 'Sarah Smith', email: 'sarah.smith@company.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike.johnson@company.com' },
    { id: '4', name: 'Emily Davis', email: 'emily.davis@company.com' },
    { id: '5', name: 'Alex Brown', email: 'alex.brown@company.com' },
    { id: '6', name: 'Lisa Wilson', email: 'lisa.wilson@company.com' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateTask = async () => {
    if (!taskForm.taskName || !taskForm.taskDescription || !taskForm.startDate || !taskForm.endDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const taskData = {
        taskName: taskForm.taskName,
        taskDescription: taskForm.taskDescription,
        techStack: taskForm.techStack,
        startDate: taskForm.startDate,
        endDate: taskForm.endDate,
        priority: taskForm.priority.toUpperCase(),
        status: 'TODO',
        assignedToId: session?.user?.id, // Assign to current user
        tags: taskForm.techStack ? taskForm.techStack.split(',').map(tech => tech.trim()) : [],
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Task "${taskForm.taskName}" has been created successfully`)
        
        // Refresh tasks list
        queryClient.invalidateQueries({ queryKey: ["user-tasks"] })
        
        setTaskForm({
          taskName: '',
          taskDescription: '',
          techStack: '',
          startDate: '',
          endDate: '',
          priority: 'Medium'
        })
        setIsCreateTaskModalOpen(false)
      } else {
        alert(`Failed to create task: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Create task error:', error)
      alert("Failed to create task. Please try again.")
    }
  }

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["user-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await res.json()
      // Return the data array from the API response
      return data.success ? data.data : []
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
          <p className="text-muted-foreground">Manage your assigned tasks and track your progress</p>
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
          <p className="text-muted-foreground">Manage your assigned tasks and track your progress</p>
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

  // Ensure tasks is an array and calculate statistics
  const tasksArray = Array.isArray(tasks) ? tasks : []
  const totalTasks = tasksArray.length
  const completedTasks = tasksArray.filter(task => task.status === 'COMPLETED').length
  const inProgressTasks = tasksArray.filter(task => task.status === 'IN_PROGRESS').length
  const pendingTasks = tasksArray.filter(task => task.status === 'TODO').length
  const overdueTasks = tasksArray.filter(task => {
    const endDate = new Date(task.endDate)
    const today = new Date()
    return endDate < today && task.status !== 'COMPLETED'
  }).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header with Task Creation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage your assigned tasks and track your progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new task.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Task Name */}
                <div className="space-y-2">
                  <Label htmlFor="taskName" className="text-sm font-semibold">Task Name *</Label>
                  <Input
                    id="taskName"
                    placeholder="Enter task name"
                    value={taskForm.taskName}
                    onChange={(e) => handleInputChange('taskName', e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Task Description */}
                <div className="space-y-2">
                  <Label htmlFor="taskDescription" className="text-sm font-semibold">Task Description *</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="Describe the task in detail"
                    value={taskForm.taskDescription}
                    onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                    className="min-h-24"
                  />
                </div>

                {/* Tech Stack */}
                <div className="space-y-2">
                  <Label htmlFor="techStack" className="text-sm font-semibold">Tech Stack</Label>
                  <Input
                    id="techStack"
                    placeholder="e.g., React, Node.js, MongoDB"
                    value={taskForm.techStack}
                    onChange={(e) => handleInputChange('techStack', e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-semibold">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={taskForm.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-semibold">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={taskForm.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-semibold">Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low Priority</SelectItem>
                      <SelectItem value="Medium">Medium Priority</SelectItem>
                      <SelectItem value="High">High Priority</SelectItem>
                      <SelectItem value="Critical">Critical Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTask}
                  className="px-6"
                >
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{inProgressTasks}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{overdueTasks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Overview
          </CardTitle>
          <CardDescription>Your task completion progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{totalTasks - completedTasks}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="filter-status">Filter by Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort-by">Sort by:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>
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
        <div className="grid gap-6">
          {tasksArray.map((task: any) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{task.taskName}</CardTitle>
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
                    <CardDescription className="text-base">{task.taskDescription}</CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Task Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={task.createdBy?.image} />
                      <AvatarFallback>
                        {task.createdBy?.name?.charAt(0) || <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        Created by {task.createdBy?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">Task creator</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(task.startDate), "MMM d")} - {format(new Date(task.endDate), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <Badge 
                      variant="outline" 
                      className={
                        task.priority === 'High' ? 'border-red-200 text-red-700' :
                        task.priority === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                        'border-green-200 text-green-700'
                      }
                    >
                      {task.priority} Priority
                    </Badge>
                  </div>
                </div>

                {/* Tech Stack */}
                {task.techStack && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1">
                      {task.techStack.split(',').map((tech: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">
                      {task.status === 'COMPLETED' ? '100%' :
                       task.status === 'IN_PROGRESS' ? '50%' :
                       task.status === 'IN_REVIEW' ? '75%' : '0%'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      task.status === 'COMPLETED' ? 100 :
                      task.status === 'IN_PROGRESS' ? 50 :
                      task.status === 'IN_REVIEW' ? 75 : 0
                    } 
                    className="h-2" 
                  />
                </div>
                
                {/* Status Update Buttons */}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
