import { cookies } from 'next/headers'

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  isActive: boolean
  emailNotifications: boolean
  createdAt: string
  updatedAt: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')?.value
    
    if (!userCookie) {
      return null
    }
    
    const user = JSON.parse(userCookie)
    return user
  } catch (error) {
    console.error('Error parsing user cookie:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}