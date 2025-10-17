'use client'

import { useState, useEffect } from 'react'
import TasksTable from '@/components/admin/TasksTable'
import CreateTaskModalWrapper from '@/components/admin/CreateTaskModalWrapper'
import ModernFilters from '@/components/admin/ModernFilters'
import { SearchParams } from '@/types'
import { CheckSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TasksPageProps {
  searchParams: Promise<SearchParams>
}

export default function TasksPage({ searchParams }: TasksPageProps) {
  const { toast } = useToast()
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Handle URL parameters to show modal
  useEffect(() => {
    const checkUrlParams = async () => {
      const params = await searchParams
      if (params.action === 'create') {
        setShowCreateModal(true)
      }
    }
    checkUrlParams()
  }, [searchParams])

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ]

  const handleClearFilters = () => {
    setSearchValue('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setDateRangeFilter('all')
  }

  const handleApplyFilters = () => {
    // Here you would typically trigger a data fetch with the current filter values
    console.log('Applying filters:', {
      search: searchValue,
      status: statusFilter,
      priority: priorityFilter,
      dateRange: dateRangeFilter
    })
    // You can add your data fetching logic here
  }

  const handleCreateTaskClose = () => {
    setShowCreateModal(false)
    // Remove the action parameter from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('action')
    window.history.replaceState({}, '', url.toString())
  }

  const handleCreateTaskSave = () => {
    setShowCreateModal(false)
    // Remove the action parameter from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('action')
    window.history.replaceState({}, '', url.toString())
    
    // Show success toast notification
    toast({
      title: "Task Created Successfully",
      description: "New task has been created and added to the system.",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    })
    
    // Reload to show the new task
    window.location.reload()
  }

  return (
    <div className="p-6 bg-stone-200 dark:bg-gray-900">
      <div className="w-full">
        <div className="space-y-6">
          {/* <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <CheckSquare className="h-8 w-8 mr-3 text-indigo-600" />
              Task Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and assign tasks to users with comprehensive filtering and status tracking
            </p>
          </div> */}

         
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="admin-card-title">Task Management</h3>
                  <p className="admin-card-description">
                    Create, assign, and track tasks with detailed status and priority management
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors admin-button-primary"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-stone-200 dark:bg-gray-700 p-4 rounded-lg">
                <TasksTable />
              </div>
            </div>
          </div>

          {/* Help Section */}
            {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Task Management Tips</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click on any task to view detailed information and edit properties</li>
                      <li>Use the status filters to view tasks by completion status (To Do, In Progress, Completed)</li>
                      <li>Priority levels help organize tasks: Critical (Red), High (Orange), Medium (Yellow), Low (Green)</li>
                      <li>Assign tasks to specific users and track their progress through the system</li>
                      <li>Use the search functionality to quickly find tasks by title, description, or assignee</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div> */}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModalWrapper 
          onClose={handleCreateTaskClose}
          onSave={handleCreateTaskSave}
        />
      )}
    </div>
  )
}
