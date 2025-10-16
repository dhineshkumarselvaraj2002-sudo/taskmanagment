import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import UserCalendarView from '@/components/user/UserCalendarView'
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default async function UserCalendarPage() {
  // Get current user from cookie
  const user = await getCurrentUser()

  // Check if user is authenticated
  if (!user) {
    redirect('/sign-in')
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
                My Calendar
              </h1>
              <p className="mt-2 text-gray-600">
                View and manage your assigned tasks on the calendar
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
                      My Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <MyTasksCount />
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
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <MyCompletedTasksCount />
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
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Progress
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <MyInProgressTasksCount />
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
                      Overdue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>}>
                        <MyOverdueTasksCount />
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
                <h3 className="text-lg font-medium text-gray-900">My Task Calendar</h3>
                <p className="text-sm text-gray-500">
                  Hover over events to see details, click for full information
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
                  <div className="text-gray-600 font-medium">Loading your calendar...</div>
                  <div className="text-gray-500 text-sm mt-2">Fetching your tasks and events</div>
                </div>
              </div>
            }>
              <UserCalendarView />
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
                  <li>Hover over any task event to see a quick preview with deadline and priority</li>
                  <li>Click on events to open detailed task information</li>
                  <li>Use the filters above the calendar to view specific statuses or priorities</li>
                  <li>Color coding: Red (Critical), Orange (High), Yellow (Medium), Green (Low)</li>
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
async function MyTasksCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/tasks?limit=100`, {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success) {
      return data.data.length
    }
  } catch (error) {
    console.error('Error fetching my tasks:', error)
  }
  return 0
}

async function MyCompletedTasksCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/tasks?status=COMPLETED&limit=100`, {
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

async function MyInProgressTasksCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/tasks?status=IN_PROGRESS&limit=100`, {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success) {
      return data.data.length
    }
  } catch (error) {
    console.error('Error fetching in progress tasks:', error)
  }
  return 0
}

async function MyOverdueTasksCount() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/tasks?status=TODO,IN_PROGRESS&limit=100`, {
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
