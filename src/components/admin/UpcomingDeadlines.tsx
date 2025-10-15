'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExtendedTask } from '@/types'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { Calendar, AlertTriangle, Clock } from 'lucide-react'

export default function UpcomingDeadlines() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingDeadlines = async () => {
      try {
        const response = await fetch('/api/admin/calendar?start=' + new Date().toISOString() + '&end=' + addDays(new Date(), 7).toISOString())
        const data = await response.json()
        if (data.success) {
          setTasks(data.data.map((event: any) => event.resource.task))
        }
      } catch (error) {
        console.error('Failed to fetch upcoming deadlines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingDeadlines()
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

  const getUrgencyColor = (endDate: Date) => {
    const now = new Date()
    const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDeadline < 0) {
      return 'text-red-600 bg-red-50'
    } else if (daysUntilDeadline <= 1) {
      return 'text-orange-600 bg-orange-50'
    } else if (daysUntilDeadline <= 3) {
      return 'text-yellow-600 bg-yellow-50'
    } else {
      return 'text-green-600 bg-green-50'
    }
  }

  const getUrgencyIcon = (endDate: Date) => {
    const now = new Date()
    const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDeadline < 0) {
      return <AlertTriangle className="h-4 w-4" />
    } else if (daysUntilDeadline <= 1) {
      return <AlertTriangle className="h-4 w-4" />
    } else {
      return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
          <Link
            href="/admin/calendar"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            View calendar
          </Link>
        </div>
        
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const daysUntilDeadline = Math.ceil((new Date(task.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getUrgencyColor(new Date(task.endDate))}`}>
                      {getUrgencyIcon(new Date(task.endDate))}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {task.taskName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Assigned to {task.assignedTo?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(task.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className={`text-xs font-medium ${getUrgencyColor(new Date(task.endDate))}`}>
                      {daysUntilDeadline < 0 
                        ? `${Math.abs(daysUntilDeadline)} days overdue`
                        : daysUntilDeadline === 0 
                        ? 'Due today'
                        : `${daysUntilDeadline} days left`
                      }
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
