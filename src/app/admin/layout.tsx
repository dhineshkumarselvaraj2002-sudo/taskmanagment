import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current user from cookie
  const user = await getCurrentUser()

  // Check if user is authenticated and is admin
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
