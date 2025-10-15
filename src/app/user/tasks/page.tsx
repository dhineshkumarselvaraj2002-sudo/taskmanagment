'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter, Search, Calendar, Clock, User, Eye, Edit, Trash2, CheckCircle, AlertCircle, XCircle, Play } from 'lucide-react'
import CreateTaskModal from '@/components/user/CreateTaskModal'
import { ExtendedTask } from '@/types'

export default function UserTasksPage() {
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('dueDate')

  const [tasks, setTasks] = useState<ExtendedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/tasks?limit=100')
      const data = await response.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.taskDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.tags && task.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        case 'priority':
          const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
        case 'status':
          return a.status.localeCompare(b.status)
        case 'title':
          return a.taskName.localeCompare(b.taskName)
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'TODO': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'IN_PROGRESS': return <Play className="w-4 h-4" />
      case 'TODO': return <Clock className="w-4 h-4" />
      case 'BLOCKED': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertCircle className="w-4 h-4" />
      case 'HIGH': return <AlertCircle className="w-4 h-4" />
      case 'MEDIUM': return <Clock className="w-4 h-4" />
      case 'LOW': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage and track your assigned tasks</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => task.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Play className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => task.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => 
                    new Date(task.endDate) < new Date() && task.status !== 'COMPLETED'
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    
      {/* Enhanced Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <CardTitle>Task List ({filteredTasks.length} tasks)</CardTitle>
              <CardDescription>Manage and track your assigned tasks</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search tasks, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Task Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                        <Badge className={`${getStatusColor(task.status)} border flex items-center gap-1`}>
                          {getStatusIcon(task.status)}
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(task.priority)} border flex items-center gap-1`}>
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </Badge>
                      </div>

                      {/* Task Description */}
                      <p className="text-gray-600 mb-4 leading-relaxed">{task.taskDescription}</p>

                      {/* Task Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {task.tags && task.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Task Details */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Due:</span>
                          <span className={new Date(task.endDate) < new Date() ? 'text-red-600 font-semibold' : ''}>
                            {new Date(task.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Assigned by:</span>
                          <span>{task.createdBy?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Est. Hours:</span>
                          <span>{task.estimatedHours}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Created:</span>
                          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>


      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={showCreateModal} 
        onClose={() => {
          setShowCreateModal(false)
          fetchTasks() // Refresh tasks after creating
        }} 
      />
    </div>
  )
}
