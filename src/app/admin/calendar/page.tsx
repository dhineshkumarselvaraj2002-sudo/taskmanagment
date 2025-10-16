import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import CalendarView from '@/components/admin/CalendarView'
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default async function CalendarPage() {
  // Get current user from cookie
  const user = await getCurrentUser()

  // Check if user is authenticated
  if (!user) {
    redirect('/sign-in')
  }

  // Check if user is admin
  if (user.role !== 'ADMIN') {
    redirect('/user/dashboard')
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-indigo-600" />
                Calendar View
              </h1>
              <p className="mt-2 text-gray-600">
                View task deadlines by hovering over calendar dates to see user assignments and task status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Upcoming Deadlines
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <UpcomingDeadlinesCount />
                      </Suspense>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <ActiveUsersCount />
                      </Suspense>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <CompletedTasksCount />
                      </Suspense>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Overdue Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <OverdueTasksCount />
                      </Suspense>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Deadline Calendar</h3>
                <p className="text-sm text-gray-500">
                  Hover over dates with deadlines to see task details, user assignments, and status
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Critical</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">High</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <div className="text-gray-600 font-medium">Loading calendar...</div>
                  <div className="text-gray-500 text-sm mt-2">Fetching tasks and events</div>
                </div>
              </div>
            }>
              <CalendarView />
            </Suspense>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Calendar Tips</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Hover over any date with deadlines to see task details, assigned users, and status</li>
                  <li>Dates with deadlines are highlighted with a subtle background color</li>
                  <li>Use the filters above the calendar to view specific users, statuses, or priorities</li>
                  <li>Priority color coding: Red (Critical), Orange (High), Yellow (Medium), Green (Low)</li>
                  <li>Switch between Month, Week, and Day views using the calendar controls</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper components for stats
async function UpcomingDeadlinesCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/tasks?status=TODO,IN_PROGRESS&limit=100`, {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success) {
      const now = new Date()
      const upcoming = data.data.filter((task: any) => 
        new Date(task.endDate) > now && new Date(task.endDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      )
      return upcoming.length
    }
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error)
  }
  return 0
}

async function ActiveUsersCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/users?limit=100`, {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success) {
      return data.data.filter((user: any) => user.role === 'USER' && user.isActive).length
    }
  } catch (error) {
    console.error('Error fetching active users:', error)
  }
  return 0
}

async function CompletedTasksCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/tasks?status=COMPLETED&limit=100`, {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success) {
      return data.data.length
    }
  } catch (error) {
    console.error('Error fetching completed tasks:', error)
  }
  return 0
}

async function OverdueTasksCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/tasks?status=TODO,IN_PROGRESS&limit=100`, {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success) {
      const now = new Date()
      const overdue = data.data.filter((task: any) => 
        new Date(task.endDate) < now && task.status !== 'COMPLETED'
      )
      return overdue.length
    }
  } catch (error) {
    console.error('Error fetching overdue tasks:', error)
  }
  return 0
}
