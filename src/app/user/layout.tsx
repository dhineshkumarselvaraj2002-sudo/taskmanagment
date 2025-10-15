import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import UserHeader from '@/components/user/UserHeader'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current user from cookie
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Header */}
      <UserHeader />

      {/* User Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/user/dashboard"
              className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Dashboard
            </a>
            <a
              href="/user/tasks"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              My Tasks
            </a>
            <a
              href="/user/calendar"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Calendar
            </a>
            <a
              href="/user/profile"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Profile
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}
