'use client'

import { Search, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NotificationBell from './NotificationBell'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
}

export default function AdminHeader() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user from localStorage (set by sign-up/sign-in)
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      // Call the sign-out API
      await fetch('/api/auth/signout', { method: 'POST' })
      
      // Clear localStorage
      localStorage.removeItem('user')
      
      // Redirect to sign-in page
      router.push('/sign-in')
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem('user')
      router.push('/sign-in')
    }
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search..."
            type="search"
            name="search"
            suppressHydrationWarning
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          {user && <NotificationBell userId={user.id} />}

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-2">
              <User className="h-6 w-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {user?.name || 'Loading...'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
