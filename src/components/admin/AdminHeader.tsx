'use client'

import { User, LogOut, Sun, Moon, Monitor } from 'lucide-react'
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
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
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

    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

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
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8 dark:bg-slate-900 dark:border-slate-700 pt-3">
      <div className="flex items-center">
       
      </div>
      
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              if (theme === 'light') {
                handleThemeChange('dark')
              } else if (theme === 'dark') {
                handleThemeChange('system')
              } else {
                handleThemeChange('light')
              }
            }}
            className="p-2 rounded-lg"
            title={`Current: ${theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'} - Click to cycle`}
          >
            {theme === 'light' ? (
              <Sun className="h-5 w-5 text-black dark:text-white" />
            ) : theme === 'dark' ? (
              <Moon className="h-5 w-5 text-black dark:text-white" />
            ) : (
              <Monitor className="h-5 w-5 text-black dark:text-white" />
            )}
          </button>
        </div>

        {/* Notifications */}
        {user && <NotificationBell userId={user.id} />}

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-slate-700" aria-hidden="true" />

        {/* Profile dropdown */}
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || 'Loading...'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
