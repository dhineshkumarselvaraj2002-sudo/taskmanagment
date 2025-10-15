import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import UserDashboardStats from '@/components/user/UserDashboardStats'
import UserRecentTasks from '@/components/user/UserRecentTasks'
import UserQuickActions from '@/components/user/UserQuickActions'

export default async function UserDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {user.name || user.email}. Manage your tasks and stay productive.
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
        <div className="mb-8">
          <Suspense fallback={
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24" />
              ))}
            </div>
          }>
            <UserDashboardStats />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <UserQuickActions />
        </div>

        {/* Recent Tasks */}
        <div className="mb-8">
          <Suspense fallback={
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
          }>
            <UserRecentTasks />
          </Suspense>
        </div>

        {/* Additional Info Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
              <p className="text-gray-600 mb-4">
                Use the quick actions above to create new tasks, view all your tasks, or check your calendar. 
                Stay organized and track your progress with our intuitive task management system.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Create Tasks
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Track Progress
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Stay Organized
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
