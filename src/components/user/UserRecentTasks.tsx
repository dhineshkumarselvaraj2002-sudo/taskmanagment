'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExtendedTask } from '@/types'
import { format } from 'date-fns'
import { Clock, User, CheckCircle, AlertCircle } from 'lucide-react'

export default function UserRecentTasks() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentTasks = async () => {
      try {
        const response = await fetch('/api/user/tasks?limit=5')
        const data = await response.json()
        if (data.success) {
          setTasks(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch recent tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentTasks()
  }, [])

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
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
      default:
        return 'bg-stone-200 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'BLOCKED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
          <Link
            href="/user/tasks"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
        
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent tasks</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {task.taskName}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {task.taskDescription}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {task.createdBy?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(task.endDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center">
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
