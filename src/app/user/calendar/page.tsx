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
    <div className="p-6 bg-stone-200 dark:bg-gray-900">
      <div className="w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-admin-heading flex items-center">    
              My Calendar
            </h1>
            <p className="mt-2 text-admin-body">
              View and manage your assigned tasks by clicking on calendar dates to see task details
            </p>
          </div>

          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              {/* <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">My Task Calendar</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hover over events to see details, click for full information
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">Critical</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">High</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">Medium</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-300">Low</span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
            
            <div className="p-6">
              <Suspense fallback={
                <div className="flex items-center justify-center h-96 bg-stone-200 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">Loading your calendar...</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">Fetching your tasks and events</div>
                  </div>
                </div>
              }>
                <UserCalendarView />
              </Suspense>
            </div>
          </div>

          {/* Help Section */}
          {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Calendar Tips</h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
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
          </div> */}
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
