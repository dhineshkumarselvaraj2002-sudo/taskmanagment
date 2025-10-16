'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  Bell, 
  Settings,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Filter,
  Clock,
  UserCheck,
  UserPlus,
  UserX,
  Archive,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    hasSubmenu: true,
    submenu: [
      { name: 'All Users', href: '/admin/users', icon: List },
      { name: 'Add User', href: '/admin/users/add', icon: UserPlus },
      { name: 'Active Users', href: '/admin/users/active', icon: UserCheck },
      { name: 'Inactive Users', href: '/admin/users/inactive', icon: UserX },
      { name: 'User Roles', href: '/admin/users/roles', icon: Settings },
    ]
  },
  { 
    name: 'Tasks', 
    href: '/admin/tasks', 
    icon: CheckSquare,
    hasSubmenu: true,
    submenu: [
      { name: 'All Tasks', href: '/admin/tasks', icon: List },
      { name: 'Create Task', href: '/admin/tasks/create', icon: Plus },
      { name: 'My Tasks', href: '/admin/tasks/my-tasks', icon: UserCheck },
      { name: 'Overdue Tasks', href: '/admin/tasks/overdue', icon: AlertCircle },
      { name: 'Completed Tasks', href: '/admin/tasks/completed', icon: CheckSquare },
      { name: 'Task Templates', href: '/admin/tasks/templates', icon: FileText },
      { name: 'Task Categories', href: '/admin/tasks/categories', icon: Filter },
    ]
  },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  // { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  // TODO: Add these pages in future updates
  // { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  // { name: 'Reports', href: '/admin/reports', icon: FileText },
  // { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isSubmenuActive = (submenu: any[]) => {
    return submenu.some(subItem => pathname === subItem.href)
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-gray-900">TaskManager</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const isExpanded = expandedItems.includes(item.name)
                  const hasActiveSubmenu = item.hasSubmenu && isSubmenuActive(item.submenu || [])
                  
                  return (
                    <li key={item.name}>
                      {item.hasSubmenu ? (
                        <>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={cn(
                              isActive || hasActiveSubmenu
                                ? 'bg-gray-50 text-indigo-600'
                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                              'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                          >
                            <item.icon
                              className={cn(
                                isActive || hasActiveSubmenu ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                'h-6 w-6 shrink-0'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                            {isExpanded ? (
                              <ChevronDown className="ml-auto h-4 w-4" />
                            ) : (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </button>
                          {isExpanded && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {item.submenu?.map((subItem) => {
                                const isSubActive = pathname === subItem.href
                                return (
                                  <li key={subItem.name}>
                                    <Link
                                      href={subItem.href}
                                      className={cn(
                                        isSubActive
                                          ? 'bg-indigo-50 text-indigo-600'
                                          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50',
                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6'
                                      )}
                                    >
                                      <subItem.icon
                                        className={cn(
                                          isSubActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                          'h-5 w-5 shrink-0'
                                        )}
                                        aria-hidden="true"
                                      />
                                      {subItem.name}
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? 'bg-gray-50 text-indigo-600'
                              : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
