'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Search, Calendar, Clock, User, Eye, Edit, Trash2, CheckCircle, AlertCircle, XCircle, Play, X } from 'lucide-react'
import TaskDetailModal from '@/components/user/TaskDetailModal'
import { ExtendedTask, TaskStatus } from '@/types'

export default function UserTasksPage() {
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState('dueDate')
  const [showFilters, setShowFilters] = useState(false)
  
  // Advanced filter states
  const [dateRange, setDateRange] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  
  // Temporary filter values (not applied until Apply button is clicked)
  const [tempStatusFilter, setTempStatusFilter] = useState('')
  const [tempPriorityFilter, setTempPriorityFilter] = useState('')
  const [tempDateRange, setTempDateRange] = useState('')

  const [tasks, setTasks] = useState<ExtendedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null)

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

  const handleViewTask = (task: ExtendedTask) => {
    setSelectedTask(task)
    setShowDetailModal(true)
  }

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )
  }

  // Filter helper functions
  const getActiveFilterCount = () => {
    let count = 0
    if (statusFilter) count++
    if (priorityFilter) count++
    if (dateRange) count++
    if (overdueOnly) count++
    return count
  }

  const hasTempChanges = () => {
    return tempStatusFilter !== statusFilter || 
           tempPriorityFilter !== priorityFilter || 
           tempDateRange !== dateRange
  }

  const applyFilters = () => {
    setStatusFilter(tempStatusFilter)
    setPriorityFilter(tempPriorityFilter)
    setDateRange(tempDateRange)
  }

  const resetTempFilters = () => {
    setTempStatusFilter(statusFilter)
    setTempPriorityFilter(priorityFilter)
    setTempDateRange(dateRange)
  }

  const clearFilters = () => {
    setStatusFilter('')
    setPriorityFilter('')
    setDateRange('')
    setTempStatusFilter('')
    setTempPriorityFilter('')
    setTempDateRange('')
    setOverdueOnly(false)
    setSearchTerm('')
  }

  // Initialize temp values when filter panel opens
  useEffect(() => {
    if (showFilters) {
      setTempStatusFilter(statusFilter)
      setTempPriorityFilter(priorityFilter)
      setTempDateRange(dateRange)
    }
  }, [showFilters, statusFilter, priorityFilter, dateRange])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    console.log('🔍 Search Debug:', {
      searchTerm,
      tasksCount: tasks.length,
      tasks: tasks.map(t => ({ id: t.id, name: t.taskName, status: t.status }))
    })
    
    let filtered = tasks.filter(task => {
      // Enhanced search functionality
      const searchLower = searchTerm.toLowerCase().trim()
      
      // Debug individual task search
      if (searchLower) {
        const nameMatch = task.taskName?.toLowerCase().includes(searchLower)
        const descMatch = task.taskDescription?.toLowerCase().includes(searchLower)
        const categoryMatch = task.category?.toLowerCase().includes(searchLower)
        const assignedMatch = task.assignedTo?.name?.toLowerCase().includes(searchLower)
        const createdMatch = task.createdBy?.name?.toLowerCase().includes(searchLower)
        const tagsMatch = task.tags && task.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
        
        console.log(`🔍 Task "${task.taskName}" search results:`, {
          searchTerm: searchLower,
          nameMatch,
          descMatch,
          categoryMatch,
          assignedMatch,
          createdMatch,
          tagsMatch,
          taskName: task.taskName,
          taskDescription: task.taskDescription,
          category: task.category,
          assignedTo: task.assignedTo?.name,
          createdBy: task.createdBy?.name,
          tags: task.tags
        })
      }
      
      const matchesSearch = !searchLower || 
                           (task.taskName?.toLowerCase().includes(searchLower)) ||
                           (task.taskDescription?.toLowerCase().includes(searchLower)) ||
                           (task.category?.toLowerCase().includes(searchLower)) ||
                           (task.assignedTo?.name?.toLowerCase().includes(searchLower)) ||
                           (task.createdBy?.name?.toLowerCase().includes(searchLower)) ||
                           (task.tags && task.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
      
      const matchesStatus = !statusFilter || task.status === statusFilter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter
      
      // Date range filter
      const taskDate = new Date(task.endDate)
      const now = new Date()
      let matchesDateRange = true
      
      if (dateRange) {
        switch (dateRange) {
          case 'TODAY':
            matchesDateRange = taskDate.toDateString() === now.toDateString()
            break
          case 'THIS_WEEK':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
            matchesDateRange = taskDate >= weekStart && taskDate <= weekEnd
            break
          case 'THIS_MONTH':
            matchesDateRange = taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear()
            break
          case 'OVERDUE':
            matchesDateRange = taskDate < now && task.status !== 'COMPLETED'
            break
          case 'UPCOMING':
            matchesDateRange = taskDate > now
            break
        }
      }
      
      // Overdue only filter
      const matchesOverdue = !overdueOnly || (taskDate < now && task.status !== 'COMPLETED')
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange && matchesOverdue
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

    console.log('🔍 Final filtered results:', {
      originalCount: tasks.length,
      filteredCount: filtered.length,
      searchTerm,
      filteredTasks: filtered.map(t => ({ id: t.id, name: t.taskName }))
    })
    
    return filtered
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy, dateRange, overdueOnly])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'TODO': return 'bg-stone-200 text-gray-800 border-gray-200'
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-stone-200 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-stone-200 text-gray-800 border-gray-200'
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
    <div className="space-y-6 ml-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage and track your assigned tasks</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="group relative bg-blue-100 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:bg-stone-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8bg-stone-200 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Total Tasks
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {tasks.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-green-100 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:bg-stone-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Completed
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {tasks.filter(task => task.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-yellow-100 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:bg-stone-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Play className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    In Progress
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {tasks.filter(task => task.status === 'IN_PROGRESS').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-red-0 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:bg-stone-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Overdue
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {tasks.filter(task => 
                      new Date(task.endDate) < new Date() && task.status !== 'COMPLETED'
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
 

      {/* Enhanced Search and Filters */}
      <Card className="border-0 shadow-none">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <CardTitle>
                Task List ({filteredTasks.length} tasks)
                {searchTerm && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    - Search results for "{searchTerm}"
                  </span>
                )}
              </CardTitle>
              <CardDescription>Manage and track your assigned tasks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Modern Search and Filters */}
          <div className="mb-8">
            {/* Search Bar and Filter Button in Single Row */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks by name, description, category, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {/* Debug: Show current search term */}
                  {searchTerm && (
                    <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                      Searching for: "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Simple Filters Panel */}
            {showFilters && (
              <div className="bg-white   rounded-lg p-3 border border-gray-200 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={tempStatusFilter}
                      onChange={(e) => setTempStatusFilter(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Status</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={tempPriorityFilter}
                      onChange={(e) => setTempPriorityFilter(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Priority</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                      value={tempDateRange}
                      onChange={(e) => setTempDateRange(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Dates</option>
                      <option value="TODAY">Today</option>
                      <option value="THIS_WEEK">This Week</option>
                      <option value="THIS_MONTH">This Month</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="UPCOMING">Upcoming</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-end gap-2">
                    {/* Apply and Reset buttons - Only show if temp values are different from applied values */}
                    {hasTempChanges() && (
                      <>
                        <button
                          onClick={applyFilters}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-stone-200 rounded transition-colors duration-200"
                        >
                          Apply
                        </button>
                        <button
                          onClick={resetTempFilters}
                          className="inline-flex items-center px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-stone-200 rounded transition-colors duration-200"
                        >
                          Reset
                        </button>
                      </>
                    )}
                    {/* Clear Filters Button - Only show if filters are applied */}
                    {getActiveFilterCount() > 0 && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-stone-200 rounded transition-colors duration-200"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No tasks found matching your search' : 'No tasks found'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No tasks match "${searchTerm}". Try a different search term or clear the search.`
                    : 'Try adjusting your filter criteria'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Task Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                        <Badge className={`${getStatusColor(task.status)} border-0 flex items-center gap-1 px-3 py-1`}>
                          {getStatusIcon(task.status)}
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(task.priority)} border-0 flex items-center gap-1 px-3 py-1`}>
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </Badge>
                        {new Date(task.endDate) < new Date() && task.status !== 'COMPLETED' && (
                          <Badge className="bg-red-100 text-red-800 border-0 flex items-center gap-1 px-3 py-1">
                            <AlertCircle className="w-4 h-4" />
                            Overdue
                          </Badge>
                        )}
                      </div>

                      {/* Task Description */}
                      <p className="text-gray-600 mb-4 leading-relaxed">{task.taskDescription}</p>

                      {/* Task Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {task.tags && task.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-stone-200 text-gray-700 text-xs rounded-full">
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

                      {/* Status Summary */}
                      <div className="mt-4 p-3 bg-stone-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Current Status:</span>
                            <Badge className={`${getStatusColor(task.status)} border-0 flex items-center gap-1`}>
                              {getStatusIcon(task.status)}
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.status === 'COMPLETED' ? '✅ Task completed' : 
                             task.status === 'IN_PROGRESS' ? '🔄 Work in progress' :
                             task.status === 'TODO' ? '📋 Ready to start' :
                             task.status === 'BLOCKED' ? '🚫 Blocked' :
                             task.status === 'IN_REVIEW' ? '👀 Under review' :
                             '❓ Unknown status'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center items-center ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleViewTask(task)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>



      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
