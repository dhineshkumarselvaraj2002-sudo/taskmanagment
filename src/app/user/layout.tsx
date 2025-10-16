import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import UserLayoutWrapper from '@/components/user/UserLayoutWrapper'

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
    <UserLayoutWrapper>
      {children}
    </UserLayoutWrapper>
  )
}
