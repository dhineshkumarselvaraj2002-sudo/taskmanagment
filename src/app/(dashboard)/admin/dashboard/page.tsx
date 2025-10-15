"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// Toast functionality will be implemented with a simple alert for now
import { 
  Users, 
  CheckSquare, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Plus,
  BarChart3,
  Target,
  Shield,
  FileText,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Database,
  UserPlus,
  Settings,
  X,
  Clock
} from "lucide-react"
import Link from "next/link"

// Sample task data for different dates (using current dates)
const getCurrentDate = () => new Date()
const getDateString = (date: Date) => date.toISOString().split('T')[0]

const today = getCurrentDate()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const dayAfter = new Date(today)
dayAfter.setDate(today.getDate() + 2)
const nextWeek = new Date(today)
nextWeek.setDate(today.getDate() + 7)

const taskData = {
  [getDateString(today)]: [
    { id: 1, title: "System Maintenance", assignee: "John Doe", priority: "High", status: "In Progress" },
    { id: 2, title: "Database Backup", assignee: "Sarah Smith", priority: "Medium", status: "Pending" }
  ],
  [getDateString(tomorrow)]: [
    { id: 3, title: "Security Update", assignee: "Mike Johnson", priority: "High", status: "Scheduled" },
    { id: 4, title: "Code Review", assignee: "Emily Davis", priority: "Low", status: "Pending" }
  ],
  [getDateString(dayAfter)]: [
    { id: 5, title: "Team Meeting", assignee: "All Team", priority: "Medium", status: "Confirmed" }
  ],
  [getDateString(nextWeek)]: [
    { id: 6, title: "Performance Testing", assignee: "Alex Brown", priority: "High", status: "In Progress" },
    { id: 7, title: "Documentation Update", assignee: "Lisa Wilson", priority: "Low", status: "Pending" }
  ]
}

export default function AdminDashboard() {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({
    taskName: '',
    taskDescription: '',
    techStack: '',
    startDate: '',
    endDate: '',
    assignedUser: '',
    priority: 'Medium'
  })

  // Sample users for assignment
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
    // Validate form
    if (!taskForm.taskName || !taskForm.taskDescription || !taskForm.startDate || !taskForm.endDate || !taskForm.assignedUser) {
      alert("Please fill in all required fields")
      return
    }

    try {
      // Find the assigned user ID from the available users
      const assignedUser = availableUsers.find(user => user.name === taskForm.assignedUser)
      
      if (!assignedUser) {
        alert("Selected user not found")
        return
      }

      const taskData = {
        taskName: taskForm.taskName,
        taskDescription: taskForm.taskDescription,
        techStack: taskForm.techStack,
        startDate: taskForm.startDate,
        endDate: taskForm.endDate,
        priority: taskForm.priority.toUpperCase(),
        status: 'TODO',
        assignedToId: assignedUser.id,
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
        alert(`Task "${taskForm.taskName}" has been created and assigned to ${taskForm.assignedUser}`)
        alert(`Notification sent to ${taskForm.assignedUser} about the new task assignment`)

        // Reset form and close modal
        setTaskForm({
          taskName: '',
          taskDescription: '',
          techStack: '',
          startDate: '',
          endDate: '',
          assignedUser: '',
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management controls
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new task and assign it to a team member.
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

                {/* Assigned User */}
                <div className="space-y-2">
                  <Label htmlFor="assignedUser" className="text-sm font-semibold">Assign to User *</Label>
                  <Select value={taskForm.assignedUser} onValueChange={(value) => handleInputChange('assignedUser', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.name}>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          
          <Button asChild variant="outline">
            <Link href="/admin/users">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,678</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+234</span> this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Database className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4TB</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-orange-600">+120GB</span> this month
              </p>
            </CardContent>
          </Card>
        </div>
      </Suspense>

      {/* Enhanced Calendar Section - Dark Theme */}
      <Card className="overflow-hidden bg-gray-900 border border-gray-700 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b border-gray-700 px-8 py-6">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold">Admin Calendar</span>
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg mt-2">System events, maintenance, and important dates</CardDescription>
        </CardHeader>
        <CardContent className="p-12 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-lg p-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-3">Interactive Calendar</h3>
                  <p className="text-base text-gray-400">Hover over any date to see assigned team members</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-12 shadow-inner border border-gray-600">
                  <style jsx>{`
                    .rdp {
                      --rdp-cell-size: 4rem;
                      --rdp-accent-color: #4f46e5;
                      --rdp-background-color: #1f2937;
                      --rdp-accent-color-dark: #6366f1;
                      --rdp-outline: 2px solid var(--rdp-accent-color);
                      --rdp-outline-selected: 2px solid var(--rdp-accent-color);
                    }
                    .rdp-day {
                      margin: 0.5rem;
                      padding: 0.5rem;
                    }
                    .rdp-table {
                      border-spacing: 0.5rem;
                    }
                  `}</style>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full scale-110"
                    disabled={(date) => date < new Date()}
                    classNames={{
                      day: "hover:bg-gray-700 transition-all duration-200 rounded-lg text-gray-300 h-16 w-16 text-lg m-2 p-2",
                      day_selected: "bg-indigo-600 text-white hover:bg-indigo-700",
                      day_today: "bg-indigo-900 text-indigo-300 font-semibold border border-indigo-500",
                      head_cell: "text-gray-400 font-semibold text-lg py-6 px-4",
                      cell: "hover:bg-gray-700 transition-colors duration-200 text-gray-300 h-16 w-16 m-2 p-2",
                      day_outside: "text-gray-600",
                      day_disabled: "text-gray-600"
                    }}
                    onDayMouseEnter={(date, modifiers, e) => {
                      const dateStr = date.toISOString().split('T')[0]
                      setHoveredDate(dateStr)
                      setPopupPosition({ x: e.clientX, y: e.clientY })
                    }}
                    onDayMouseLeave={() => {
                      setHoveredDate(null)
                    }}
                  />
                </div>
              </div>
              
              {/* Minimal Date Info Popup - Inside Calendar */}
              {hoveredDate && (
                <div 
                  className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 min-w-48 max-w-64 animate-in fade-in-0 zoom-in-95 duration-200"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute'
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white mb-2">
                      {new Date(hoveredDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {taskData[hoveredDate as keyof typeof taskData] && taskData[hoveredDate as keyof typeof taskData].length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400 mb-2">Assigned Users:</div>
                        {taskData[hoveredDate as keyof typeof taskData].map((task, index) => (
                          <div key={task.id} className="flex items-center space-x-2 py-1 px-2 bg-gray-700 rounded text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                              index === 0 ? 'bg-indigo-500' :
                              index === 1 ? 'bg-purple-500' :
                              index === 2 ? 'bg-green-500' :
                              'bg-orange-500'
                            }`}>
                              {task.assignee.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <span className="text-white truncate">{task.assignee}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 py-2">
                        No task assigned
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Upcoming Events</h3>
                  <p className="text-sm text-gray-400">Scheduled system events and meetings</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-900 hover:to-indigo-900">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex-shrink-0 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">System Maintenance</p>
                      <p className="text-xs text-blue-300 font-medium">Today 11:00 PM - 1:00 AM</p>
                    </div>
                    <Badge className="bg-red-900 text-red-300 border border-red-700 font-semibold">Critical</Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-900 hover:to-emerald-900">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Security Update</p>
                      <p className="text-xs text-green-300 font-medium">Tomorrow 9:00 AM</p>
                    </div>
                    <Badge className="bg-orange-900 text-orange-300 border border-orange-700 font-semibold">High</Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:from-yellow-900 hover:to-amber-900">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Database Backup</p>
                      <p className="text-xs text-yellow-300 font-medium">Daily at 2:00 AM</p>
                    </div>
                    <Badge className="bg-blue-900 text-blue-300 border border-blue-700 font-semibold">Routine</Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-900 hover:to-pink-900">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Team Meeting</p>
                      <p className="text-xs text-purple-300 font-medium">Day After Tomorrow 2:00 PM</p>
                    </div>
                    <Badge className="bg-purple-900 text-purple-300 border border-purple-700 font-semibold">Meeting</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Assignment Management */}
      <Card className="overflow-hidden bg-white border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">Task Assignment Management</span>
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Manage task assignments, reassign tasks, and track progress
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Task Assignment Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  View All Tasks
                </Button>
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Filter by Status
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Total Tasks:</span>
                <Badge variant="secondary" className="px-3 py-1">24</Badge>
              </div>
            </div>

            {/* Task Assignment Table */}
            <div className="bg-gray-50 rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Task</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Sample Task Rows */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">System Maintenance</div>
                          <div className="text-sm text-gray-500">Database optimization and cleanup</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            JD
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">John Doe</div>
                            <div className="text-sm text-gray-500">john.doe@company.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">Dec 15, 2024</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Reassign
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">Security Update</div>
                          <div className="text-sm text-gray-500">Implement latest security patches</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            SS
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Sarah Smith</div>
                            <div className="text-sm text-gray-500">sarah.smith@company.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">Dec 18, 2024</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Reassign
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">Code Review</div>
                          <div className="text-sm text-gray-500">Review and approve pull requests</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            MJ
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Mike Johnson</div>
                            <div className="text-sm text-gray-500">mike.johnson@company.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">Dec 12, 2024</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" disabled>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Reassign
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">Performance Testing</div>
                          <div className="text-sm text-gray-500">Load testing and optimization</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            AB
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Alex Brown</div>
                            <div className="text-sm text-gray-500">alex.brown@company.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">Dec 20, 2024</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Reassign
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-900">8</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">6</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Completed</p>
                    <p className="text-2xl font-bold text-green-900">10</p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">2</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Active users and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Online Users</span>
                <span className="font-medium">342</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Active Users</span>
                <span className="font-medium">1,156</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Active Users</span>
                <span className="font-medium">3,456</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +15% increase in engagement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Tasks by status and priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-sm font-medium">4,234 (68%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="text-sm font-medium">1,456 (23%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium">512 (8%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm">Overdue</span>
                </div>
                <span className="text-sm font-medium">89 (1%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and System Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">john.doe@company.com</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 min ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Task completed</p>
                    <p className="text-xs text-muted-foreground">Project Alpha - Phase 1</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">15 min ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">System maintenance</p>
                    <p className="text-xs text-muted-foreground">Scheduled for tonight</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Security scan completed</p>
                    <p className="text-xs text-muted-foreground">No threats detected</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">High CPU Usage</p>
                    <p className="text-xs text-muted-foreground">Server 3 at 95% capacity</p>
                  </div>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Storage Warning</p>
                    <p className="text-xs text-muted-foreground">85% of storage used</p>
                  </div>
                </div>
                <Badge variant="secondary">Warning</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Backup Completed</p>
                    <p className="text-xs text-muted-foreground">Daily backup successful</p>
                  </div>
                </div>
                <Badge variant="outline">Info</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Security Update</p>
                    <p className="text-xs text-muted-foreground">All systems updated</p>
                  </div>
                </div>
                <Badge variant="outline">Success</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/admin/users">
                <UserPlus className="h-6 w-6 mb-2" />
                <span>Manage Users</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/admin/tasks">
                <CheckSquare className="h-6 w-6 mb-2" />
                <span>View All Tasks</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/admin/reports">
                <FileText className="h-6 w-6 mb-2" />
                <span>Generate Reports</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/admin/settings">
                <Settings className="h-6 w-6 mb-2" />
                <span>System Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading Skeletons
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
