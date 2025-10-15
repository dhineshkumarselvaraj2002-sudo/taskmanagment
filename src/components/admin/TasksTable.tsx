'use client'

import { useEffect, useState } from 'react'
import { ExtendedTask, ExtendedUser } from '@/types'
import { format } from 'date-fns'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import EditTaskModal from './EditTaskModal'
import DeleteTaskModal from './DeleteTaskModal'

export default function TasksTable() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([])
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null)
  const [deletingTask, setDeletingTask] = useState<ExtendedTask | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo && { assignedTo })
      })
      
      const response = await fetch(`/api/admin/tasks?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=100')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [page, search, status, priority, assignedTo])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTasks()
  }

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId))
        setDeletingTask(null)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          {/* Search and Filters */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  suppressHydrationWarning
                >
                  <option value="">All Status</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
              <div>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  suppressHydrationWarning
                >
                  <option value="">All Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  suppressHydrationWarning
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
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
                {tasks.map((task) => (
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
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {task.assignedTo?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.assignedTo?.email}
                          </div>
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
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(task.endDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTask(task)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
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
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
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
            fetchTasks()
          }}
        />
      )}

      {deletingTask && (
        <DeleteTaskModal
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onConfirm={() => {
            handleDelete(deletingTask.id)
            setDeletingTask(null)
          }}
        />
      )}
    </>
  )
}
