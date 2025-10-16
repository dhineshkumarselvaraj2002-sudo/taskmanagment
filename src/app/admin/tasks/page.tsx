'use client'

import { useState, useEffect } from 'react'
import TasksTable from '@/components/admin/TasksTable'
import CreateTaskModalWrapper from '@/components/admin/CreateTaskModalWrapper'
import ModernFilters from '@/components/admin/ModernFilters'
import { SearchParams } from '@/types'

interface TasksPageProps {
  searchParams: Promise<SearchParams>
}

export default function TasksPage({ searchParams }: TasksPageProps) {
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
    // Reload to show the new task
    window.location.reload()
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="mt-1 text-gray-600">Manage and assign tasks to users</p>
            </div>
            <div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </button>
            </div>
          </div>

          {/* Modern Filters */}
          {/* <ModernFilters
            searchPlaceholder="Search tasks by title, description, or assignee..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filters={{
              status: {
                options: statusOptions,
                value: statusFilter,
                onChange: setStatusFilter
              },
              priority: {
                options: priorityOptions,
                value: priorityFilter,
                onChange: setPriorityFilter
              },
              dateRange: {
                value: dateRangeFilter,
                onChange: setDateRangeFilter
              }
            }}
            onClearFilters={handleClearFilters}
            onApplyFilters={handleApplyFilters}
          /> */}
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <TasksTable />
          </div>
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
