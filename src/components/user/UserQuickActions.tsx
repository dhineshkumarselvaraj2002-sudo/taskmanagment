'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, List, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import CreateTaskModal from './CreateTaskModal'

export default function UserQuickActions() {
  const [loading, setLoading] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  const handleCreateTask = () => {
    setShowCreateModal(true)
  }

  const handleViewAllTasks = () => {
    setLoading('view')
    try {
      router.push('/user/tasks')
    } catch (error) {
      console.error('Error navigating to tasks:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleViewCalendar = () => {
    setLoading('calendar')
    try {
      router.push('/user/calendar')
    } catch (error) {
      console.error('Error navigating to calendar:', error)
    } finally {
      setLoading(null)
    }
  }

  const actions = [
    {
      id: 'create',
      name: 'Create New Task',
      description: 'Add a new task to your list',
      icon: Plus,
      color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      hoverColor: 'hover:from-indigo-600 hover:to-purple-700',
      textColor: 'text-white',
      onClick: handleCreateTask,
      loading: false
    },
    {
      id: 'view',
      name: 'View All Tasks',
      description: 'See all your assigned tasks',
      icon: List,
      color: 'bg-white',
      hoverColor: 'hover:bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      onClick: handleViewAllTasks,
      loading: loading === 'view'
    },
    {
      id: 'calendar',
      name: 'View Calendar',
      description: 'Check your task calendar',
      icon: Calendar,
      color: 'bg-white',
      hoverColor: 'hover:bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      onClick: handleViewCalendar,
      loading: loading === 'calendar'
    }
  ]

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your tasks efficiently</p>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">Ready to work</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.loading}
              className={`relative group p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                action.color
              } ${action.hoverColor} ${action.textColor} ${
                action.borderColor || 'border-transparent'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${
                  action.id === 'create' 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-indigo-100'
                }`}>
                  {action.loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent"></div>
                  ) : (
                    <action.icon className={`h-6 w-6 ${
                      action.id === 'create' ? 'text-white' : 'text-indigo-600'
                    }`} />
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm">
                    {action.name}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    action.id === 'create' ? 'text-white text-opacity-90' : 'text-gray-500'
                  }`}>
                    {action.description}
                  </p>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
              </div>
            </button>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Quick Tips</h4>
              <p className="text-xs text-blue-700 mt-1">
                Use the calendar to see all your deadlines at a glance, or create new tasks to stay organized.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  )
}
