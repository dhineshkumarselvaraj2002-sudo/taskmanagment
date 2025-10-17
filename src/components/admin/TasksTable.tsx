'use client'

import { useState, useEffect } from 'react'
import { ExtendedTask, ExtendedUser } from '@/types'
import { format } from 'date-fns'
import { 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Clock,
  Search,
  Filter,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import EditTaskModal from './EditTaskModal'
import { useTasks, useDeleteTask } from '@/hooks/use-tasks'
import { useQueryClient } from '@tanstack/react-query'
import { useUsers } from '@/hooks/use-users'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'

export default function TasksTable() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [page, setPage] = useState(1)
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)
  
  // Temporary filter values (not applied until Apply button is clicked)
  const [tempStatus, setTempStatus] = useState('')
  const [tempPriority, setTempPriority] = useState('')
  const [tempAssignedTo, setTempAssignedTo] = useState('')

  // Debounce search input with 2 second delay
  const debouncedSearch = useDebounce(search, 2000)

  // Use TanStack Query for data fetching
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasks({
    page,
    limit: 5,
    search: debouncedSearch,
    status,
    priority,
    assignedTo,
  })

  const { data: usersData, isLoading: usersLoading } = useUsers({
    limit: 100,
  })

  const deleteTaskMutation = useDeleteTask()

  // Extract data from queries
  const tasks = tasksData?.data || []
  const users = usersData?.data || []
  const totalPages = tasksData?.pagination?.totalPages || 1
  const loading = tasksLoading || usersLoading

  // TanStack Query handles data fetching automatically

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    // TanStack Query will automatically refetch when search state changes
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPriority('')
    setAssignedTo('')
    setTempStatus('')
    setTempPriority('')
    setTempAssignedTo('')
    setPage(1)
    // Force a refetch after clearing filters
    setTimeout(() => {
      // Invalidate all task queries to force a refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }, 100)
  }

  const applyFilters = () => {
    setStatus(tempStatus)
    setPriority(tempPriority)
    setAssignedTo(tempAssignedTo)
    setPage(1)
  }

  const resetTempFilters = () => {
    setTempStatus(status)
    setTempPriority(priority)
    setTempAssignedTo(assignedTo)
  }

  // Check if any temp values are different from applied values
  const hasTempChanges = () => {
    return tempStatus !== status || tempPriority !== priority || tempAssignedTo !== assignedTo
  }

  // Initialize temp values when filter panel opens
  useEffect(() => {
    if (showFilters) {
      setTempStatus(status)
      setTempPriority(priority)
      setTempAssignedTo(assignedTo)
    }
  }, [showFilters, status, priority, assignedTo])

  const getActiveFilterCount = () => {
    let count = 0
    // Only count actual filter options, not search
    if (status) count++
    if (priority) count++
    if (assignedTo) count++
    return count
  }

  const handleDelete = async (task: ExtendedTask) => {
    try {
      await deleteTaskMutation.mutateAsync(task.id)
      // Dispatch event to refresh notifications immediately
      window.dispatchEvent(new CustomEvent('taskDeleted', { 
        detail: { taskId: task.id, taskName: task.taskName } 
      }))
      toast({
        title: "Task Deleted Successfully",
        description: `Task "${task.taskName}" has been deleted.`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast({
        title: "Error Deleting Task",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800'
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Modern Search and Filters */}
          <div className="mb-8">
            {/* Search Bar and Filter Button in Single Row */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
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
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Status Filter */}
                  <div>
                    <select
                      value={tempStatus}
                      onChange={(e) => setTempStatus(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Status</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <select
                      value={tempPriority}
                      onChange={(e) => setTempPriority(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Priority</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  {/* User Filter */}
                  <div>
                    <select
                      value={tempAssignedTo}
                      onChange={(e) => setTempAssignedTo(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Users</option>
                      {users.map((user: ExtendedUser) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Apply and Reset buttons - Only show if temp values are different from applied values */}
                    {hasTempChanges() && (
                      <>
                        <button
                          onClick={applyFilters}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
                        >
                          Apply
                        </button>
                        <button
                          onClick={resetTempFilters}
                          className="inline-flex items-center px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                        >
                          Reset
                        </button>
                      </>
                    )}
                    {/* Clear Filters Button - Only show if filters are applied */}
                    {getActiveFilterCount() > 0 && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
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

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task: ExtendedTask) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.taskName}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {task.taskDescription}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-indigo-200">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {task.assignedTo?.name || 'Unassigned'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.assignedTo?.email || 'No assignment'}
                          </div>
                          {task.assignedTo && (
                            <div className="text-xs text-indigo-600 font-medium mt-1">
                              ✓ Assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(task.endDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Edit button clicked for task:', task.id)
                            console.log('Event target:', e.target)
                            console.log('Event currentTarget:', e.currentTarget)
                            setEditingTask(task)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          type="button"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete(task)
                          }}
                          className="text-red-600 hover:text-red-900"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((page - 1) * 5) + 1}-{Math.min(page * 5, tasksData?.pagination?.total || 0)} of {tasksData?.pagination?.total || 0} tasks
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          users={users}
          onClose={() => setEditingTask(null)}
          onSave={() => {
            setEditingTask(null)
            // TanStack Query will automatically refetch
          }}
        />
      )}

    </>
  )
}
