import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper'

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
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  )
}
