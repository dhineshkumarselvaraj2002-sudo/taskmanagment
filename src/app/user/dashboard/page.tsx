import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import UserDashboardStats from '@/components/user/UserDashboardStats'
import UserRecentTasks from '@/components/user/UserRecentTasks'
import UserQuickActions from '@/components/user/UserQuickActions'
import UserCalendarView from '@/components/user/UserCalendarView'

export default async function UserDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="p-6 pl-4">
      <div className="max-w-full">
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

        {/* Calendar Section */}
       

        {/* Additional Info Section */}
       
      </div>
    </div>
  )
}
