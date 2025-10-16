'use client'

import { useState } from 'react'
import CalendarView from '@/components/admin/CalendarView'
import ModernFilters from '@/components/admin/ModernFilters'
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function CalendarPage() {
  const [searchValue, setSearchValue] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const userOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'admin', label: 'Admin Users' },
    { value: 'user', label: 'Regular Users' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' }
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
    setUserFilter('all')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const handleApplyFilters = () => {
    // Here you would typically trigger a data fetch with the current filter values
    console.log('Applying filters:', {
      search: searchValue,
      user: userFilter,
      status: statusFilter,
      priority: priorityFilter
    })
    // You can add your data fetching logic here
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-indigo-600" />
                Calendar View
              </h1>
              <p className="mt-2 text-gray-600">
                View task deadlines by hovering over calendar dates to see user assignments and task status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

        
        </div>

        {/* Calendar Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Deadline Calendar</h3>
                <p className="text-sm text-gray-500">
                  Hover over dates with deadlines to see task details, user assignments, and status
                </p>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Critical</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">High</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <CalendarView />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Calendar Tips</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Hover over any date with deadlines to see task details, assigned users, and status</li>
                  <li>Dates with deadlines are highlighted with a subtle background color</li>
                  <li>Use the filters above the calendar to view specific users, statuses, or priorities</li>
                  <li>Priority color coding: Red (Critical), Orange (High), Yellow (Medium), Green (Low)</li>
                  <li>Switch between Month, Week, and Day views using the calendar controls</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
