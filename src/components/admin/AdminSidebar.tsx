'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  Bell, 
  Settings,
  BarChart3,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  // TODO: Add these pages in future updates
  // { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  // { name: 'Reports', href: '/admin/reports', icon: FileText },
  // { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

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
                  return (
                    <li key={item.name}>
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
