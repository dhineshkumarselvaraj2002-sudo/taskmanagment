'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  Bell, 
  Settings,
  BarChart3,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  User as UserIcon,
  Mail,
  Shield,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  // { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  // TODO: Add these pages in future updates
  // { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  // { name: 'Reports', href: '/admin/reports', icon: FileText },
  // { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  image?: string
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showProfileTab, setShowProfileTab] = useState(false)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleProfileTab = () => {
    setShowProfileTab(!showProfileTab)
  }

  return (
    <div className={cn(
      "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "lg:w-16" : "lg:w-64"
    )}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 pb-4 shadow-2xl border-r border-slate-700/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/10">
                <span className="text-white font-bold text-sm">TM</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-100">TaskManager</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200 hover:scale-105 active:scale-95"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-slate-300 hover:text-white transition-colors" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-slate-300 hover:text-white transition-colors" />
            )}
          </button>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-l-4 border-blue-400 shadow-lg'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/30 hover:shadow-md',
                          'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white',
                            'h-5 w-5 shrink-0 transition-colors duration-200'
                          )}
                          aria-hidden="true"
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
        
        {/* Profile Section */}
        <div className="mt-auto pt-4 border-t border-slate-700/50">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 cursor-pointer hover:bg-slate-700/30 transition-all duration-200" onClick={toggleProfileTab}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/10">
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'Loading...'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || 'admin@taskmanager.com'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/10 cursor-pointer hover:scale-105 transition-all duration-200" 
                onClick={toggleProfileTab}
                title="View Profile"
              >
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tab Overlay */}
      {showProfileTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Details</h2>
              <button
                onClick={toggleProfileTab}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              {/* Profile Avatar & Basic Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/10 mx-auto mb-4">
                  {user?.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || 'Loading...'}</h3>
                <p className="text-gray-600 dark:text-slate-400">{user?.email || 'admin@taskmanager.com'}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Full Name</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{user?.name || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Address</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{user?.email || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Role</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{user?.role || 'ADMIN'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last Active</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Just now</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Account Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Security Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left">
                    <Bell className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Notifications</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
