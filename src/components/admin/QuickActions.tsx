'use client'

import Link from 'next/link'
import { Plus, Users, CheckSquare, Calendar, Bell } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      name: 'Add User',
      href: '/admin/users?action=create',
      icon: Users,
      description: 'Create a new user account',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      name: 'Create Task',
      href: '/admin/tasks?action=create',
      icon: CheckSquare,
      description: 'Assign a new task',
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      name: 'View Calendar',
      href: '/admin/calendar',
      icon: Calendar,
      description: 'See tasks on calendar',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      description: 'Manage notifications',
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
    }
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={`relative rounded-lg border border-gray-300 ${action.color} px-6 py-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center">
                <action.icon className="h-8 w-8 mr-3" />
                <div>
                  <h4 className="text-sm font-medium">{action.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
