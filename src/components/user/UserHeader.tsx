'use client'

import { User, LogOut, Sun, Moon, Monitor, Menu, Search, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NotificationBell from '@/components/admin/NotificationBell'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
}

type SidebarMode = 'expanded' | 'collapsed' | 'floating' | 'overlay'

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    
    // Get user from localStorage (set by sign-up/sign-in)
    const userData = localStorage.getItem('user')
    console.log('UserHeader - localStorage userData:', userData)
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('UserHeader - parsed user:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // Get sidebar mode from localStorage
    const savedSidebarMode = localStorage.getItem('userSidebarMode') as SidebarMode | null
    if (savedSidebarMode) {
      setSidebarMode(savedSidebarMode)
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

  const cycleSidebarMode = () => {
    const modes: SidebarMode[] = ['expanded', 'collapsed', 'floating', 'overlay']
    const currentIndex = modes.indexOf(sidebarMode)
    const nextIndex = (currentIndex + 1) % modes.length
    const newMode = modes[nextIndex]
    
    setSidebarMode(newMode)
    localStorage.setItem('userSidebarMode', newMode)
    
    // Trigger a custom event to notify the sidebar
    window.dispatchEvent(new CustomEvent('userSidebarModeChange', { detail: newMode }))
  }

  const setSidebarModeDirect = (mode: SidebarMode) => {
    setSidebarMode(mode)
    localStorage.setItem('userSidebarMode', mode)
    
    // Trigger a custom event to notify the sidebar
    window.dispatchEvent(new CustomEvent('userSidebarModeChange', { detail: mode }))
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

  if (!isClient) {
    return (
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search or type command..."
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="inline-flex items-center px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-600">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              User
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Search Bar - TailAdmin Style */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search or type command..."
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            suppressHydrationWarning
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="inline-flex items-center px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-600">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Theme Switcher - TailAdmin Style */}
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
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={`Current: ${theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'} - Click to cycle`}
          suppressHydrationWarning
        >
          {theme === 'light' ? (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : theme === 'dark' ? (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Notifications - TailAdmin Style */}
        {isClient && user && (
          <NotificationBell userId={user.id} />
        )}

        {/* Profile - TailAdmin Style */}
        <div className="flex items-center gap-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isClient ? (user?.name || 'User') : 'User'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}