import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentTasks from '@/components/admin/RecentTasks'
import UpcomingDeadlines from '@/components/admin/UpcomingDeadlines'
import QuickActions from '@/components/admin/QuickActions'
import TasksChart from '@/components/admin/TasksChart'
import AnalyticsSection from '@/components/admin/AnalyticsSection'

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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Overview of your task management system
            </p>
          </div>

          {/* Dashboard Stats */}
          <DashboardStats />

         {/* Analytics Section */}
         <div className="bg-white rounded-lg shadow-sm p-6">
            <AnalyticsSection />
          </div>

          {/* Upcoming Deadlines */}
          <UpcomingDeadlines />

          
        </div>
      </div>
    </div>
  )
}
