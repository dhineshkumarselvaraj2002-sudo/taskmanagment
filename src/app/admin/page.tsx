import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentTasks from '@/components/admin/RecentTasks'
import UpcomingDeadlines from '@/components/admin/UpcomingDeadlines'
import QuickActions from '@/components/admin/QuickActions'
import TasksChart from '@/components/admin/TasksChart'

export default async function AdminDashboard() {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Overview of your task management system
            </p>
          </div>

          {/* Dashboard Stats */}
          <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-lg" />}>
            <DashboardStats />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-lg" />}>
              <TasksChart />
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-lg" />}>
              <RecentTasks />
            </Suspense>
          </div>

          {/* Upcoming Deadlines */}
          <Suspense fallback={<div className="animate-pulse h-48 bg-gray-200 rounded-lg" />}>
            <UpcomingDeadlines />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
