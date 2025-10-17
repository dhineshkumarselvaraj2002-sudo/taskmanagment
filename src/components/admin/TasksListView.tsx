'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Task {
  id: string
  taskName: string
  description: string
  status: string
  priority: string
  progress: number
  assignedTo: { id: string; name: string; email: string } | null
  startDate: string
  endDate: string
  createdAt: string
}

interface TasksListViewProps {
  selectedUser?: string
  selectedStatus?: string
  selectedPriority?: string
}

export default function TasksListView({ 
  selectedUser, 
  selectedStatus, 
  selectedPriority 
}: TasksListViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchTasks()
  }, [selectedUser, selectedStatus, selectedPriority])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedUser) params.append('assignedTo', selectedUser)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedPriority) params.append('priority', selectedPriority)
      params.append('limit', '100')
      
      const response = await fetch(`/api/admin/tasks?${params}`)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'BLOCKED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'BLOCKED':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-stone-200 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-stone-200 text-gray-700 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'HIGH':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'MEDIUM':
        return <ClockIcon className="h-4 w-4" />
      case 'LOW':
        return <ClockIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        break
      case 'priority':
        const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
        comparison = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                   (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        break
      case 'status':
        const statusOrder = { 'BLOCKED': 4, 'IN_PROGRESS': 3, 'IN_REVIEW': 2, 'COMPLETED': 1, 'TODO': 0 }
        comparison = (statusOrder[b.status as keyof typeof statusOrder] || 0) - 
                   (statusOrder[a.status as keyof typeof statusOrder] || 0)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status')}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-stone-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
            <p className="text-gray-500">No tasks match your current filters.</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {task.taskName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`px-2 py-1 text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(task.priority)}
                            <span>{task.priority}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200">
                              <UserIcon className="h-3 w-3 text-indigo-600" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {task.assignedTo?.name || 'Unassigned'}
                              </span>
                              {task.assignedTo && (
                                <div className="text-xs text-indigo-600">Assigned</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Due {format(new Date(task.endDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Progress:</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{task.progress}%</span>
                        </div>
                        
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
