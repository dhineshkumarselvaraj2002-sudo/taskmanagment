'use client'

import { useState, useEffect } from 'react'
import { ExtendedUser } from '@/types'
import { format } from 'date-fns'
import { 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

// Custom styles for modern calendar design
const calendarStyles = `
  /* Reset and basic styles */
  .modern-calendar {
    font-family: 'Inter', system-ui, sans-serif !important;
  }
  
  .modern-calendar .rbc-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    padding: 12px 8px;
    border: none;
    font-size: 14px;
  }
  
  .modern-calendar .rbc-month-view {
    border: 1px solid #e5e7eb;
  }
  
  .modern-calendar .rbc-date-cell {
    padding: 8px;
    border: 1px solid #f3f4f6;
    min-height: 100px;
    position: relative;
    background: white;
  }
  
  .modern-calendar .rbc-date-cell.rbc-off-range-bg {
    background-color: #f8fafc;
    color: #94a3b8;
  }
  
  .modern-calendar .rbc-date-cell.rbc-today {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 8px;
    margin: 2px;
  }
  
  .modern-calendar .rbc-date-cell.rbc-today .rbc-button-link {
    color: #92400e;
    font-weight: 700;
  }
  
  /* Force date numbers to be visible */
  .modern-calendar .rbc-button-link {
    color: #374151 !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    text-decoration: none !important;
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    text-align: center !important;
    line-height: 1 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    background: none !important;
    cursor: pointer !important;
  }
  
  .modern-calendar .rbc-button-link:hover {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
    color: #3730a3 !important;
  }
  
  /* Ensure date cells show content */
  .modern-calendar .rbc-date-cell {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
  
  .modern-calendar .rbc-toolbar {
    background: white;
    border: none;
    padding: 16px 0;
    margin-bottom: 16px;
  }
  
  .modern-calendar .rbc-toolbar button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .modern-calendar .rbc-toolbar button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .modern-calendar .rbc-toolbar button.rbc-active {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }
  
  .modern-calendar .rbc-toolbar-label {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }
  
  .modern-calendar .rbc-event {
    border: none;
    border-radius: 6px;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .modern-calendar .rbc-event:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .modern-calendar .rbc-month-row {
    border: none;
  }
  
  .modern-calendar .rbc-row {
    border: none;
  }
  
  .modern-calendar .rbc-row-segment {
    border: none;
  }
  
  /* Debug: Add visible borders to see structure */
  .modern-calendar .rbc-month-view {
    border: 2px solid #e5e7eb !important;
  }
  
  .modern-calendar .rbc-date-cell {
    border: 1px solid #d1d5db !important;
  }
`

interface DeadlineData {
  date: string
  tasks: Array<{
    id: string
    taskName: string
    status: string
    priority: string
    progress: number
    assignedTo: { id: string; name: string; email: string } | null
    endDate: string
  }>
}

export default function UserCalendarView() {
  const [deadlineData, setDeadlineData] = useState<DeadlineData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    console.log('UserCalendarView mounted, fetching data...')
    fetchDeadlineData()
  }, [selectedStatus, selectedPriority, currentDate])

  const fetchDeadlineData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedPriority) params.append('priority', selectedPriority)
      
      // Get current month range based on selected date
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      params.append('start', startOfMonth.toISOString())
      params.append('end', endOfMonth.toISOString())
      
      const response = await fetch(`/api/user/calendar?${params}`)
      const data = await response.json()
      
      if (data.success) {
        console.log('User deadline data received:', data.data)
        setDeadlineData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user deadline data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter tasks based on selected filters
  const getFilteredTasks = (tasks: any[]) => {
    return tasks.filter(task => {
      const statusMatch = !selectedStatus || task.status === selectedStatus
      const priorityMatch = !selectedPriority || task.priority === selectedPriority
      return statusMatch && priorityMatch
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS':
        return <ClockIcon className="h-4 w-4 text-blue-500" />
      case 'BLOCKED':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-700'
      case 'BLOCKED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-700 border border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    console.log('Mouse enter target:', target)
    
    const dateCell = target.closest('.rbc-date-cell')
    console.log('Date cell found:', dateCell)
    
    if (!dateCell) return
    
    // Try multiple selectors to find the date
    const dateText = dateCell.querySelector('.rbc-button-link')?.textContent || 
                     dateCell.querySelector('button')?.textContent ||
                     dateCell.textContent?.trim()
    
    console.log('Date text found:', dateText)
    
    if (!dateText) return
    
    const day = parseInt(dateText)
    console.log('Parsed day:', day)
    
    if (isNaN(day)) return
    
    // Get current month and year from the calendar
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateString = `${year}-${month}-${dayStr}`
    
    console.log('Generated date string:', dateString)
    console.log('Available deadline data:', deadlineData)
    
    const dateData = deadlineData.find(d => d.date === dateString)
    console.log('Found date data:', dateData)
    
    if (dateData && dateData.tasks.length > 0) {
      console.log('Setting hovered date:', dateString)
      setHoveredDate(dateString)
      setHoverPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDate(null)
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Simple custom calendar component
  const renderCustomCalendar = () => {
    const today = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Add day headers
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
          {dayNames[i]}
        </div>
      )
    }
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 h-20 border border-gray-200 bg-gray-50"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dateData = deadlineData.find(d => d.date === dateString)
      
      // Apply client-side filtering to tasks
      const filteredTasks = dateData ? getFilteredTasks(dateData.tasks) : []
      const hasDeadlines = filteredTasks.length > 0
      const isToday = day === today.getDate()
      
      days.push(
        <div 
          key={day}
          className={`p-2 h-20 border border-gray-200 cursor-pointer transition-all duration-200 ${
            hasDeadlines 
              ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-md' 
              : 'hover:bg-gray-50'
          } ${isToday ? 'bg-yellow-100 border-yellow-300' : ''}`}
          onMouseEnter={(e) => {
            if (hasDeadlines) {
              setHoveredDate(dateString)
              setHoverPosition({ x: e.clientX, y: e.clientY })
            }
          }}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <div className="flex flex-col h-full space-y-1">
            <div className={`text-sm font-semibold ${isToday ? 'text-yellow-800' : 'text-gray-900'}`}>
              {day}
            </div>
            {hasDeadlines && (
              <div className="space-y-1 flex-1">
                {filteredTasks.slice(0, 2).map((task, index) => (
                  <div key={index} className="space-y-1">
                    {/* Task Name */}
                    <div
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        task.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : task.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : task.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}
                    >
                      {task.taskName.length > 10 ? task.taskName.substring(0, 10) + '...' : task.taskName}
                    </div>
                    {/* Status */}
                    <div className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
                {filteredTasks.length > 2 && (
                  <div className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 text-center border border-gray-200">
                    +{filteredTasks.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {days}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
      {/* Filters */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Task Filters</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Active filters</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Task Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-sm"
              >
                <option value="">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority Level
              </label>
              <select
                id="priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-sm"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Calendar */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-6">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Hover over dates with deadlines to see task details
                </p>
              </div>
              {/* Active Filters Display */}
              {(selectedStatus || selectedPriority) && (
                <div className="flex flex-wrap gap-2">
                  {selectedStatus && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Status: {selectedStatus.replace('_', ' ')}
                    </span>
                  )}
                  {selectedPriority && (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      Priority: {selectedPriority}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={goToPreviousMonth}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm"
                title="Previous Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm"
                title="Next Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-[420px] overflow-auto">
            {deadlineData.length === 0 ? (
              <div className="flex items-center justify-center h-full py-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">No Tasks Found</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      No tasks with deadlines found for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      Try adjusting your filters or check if tasks have been assigned deadlines
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              renderCustomCalendar()
            )}
          </div>
          
          {/* Task Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Task Summary</h4>
                  <p className="text-xs text-gray-500">Current month overview</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {deadlineData.reduce((total, dateGroup) => total + dateGroup.tasks.length, 0)}
                </div>
                <div className="text-xs text-gray-500">total tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Hover Popup */}
      {hoveredDate && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl transform transition-all duration-200 max-w-sm"
          style={{
            left: Math.min(hoverPosition.x + 15, window.innerWidth - 400),
            top: Math.max(hoverPosition.y - 10, 10),
            pointerEvents: 'none',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <h4 className="text-sm font-semibold text-white">
                  {format(new Date(hoveredDate), 'MMM dd, yyyy')}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-white" />
                <span className="text-sm text-white opacity-90 font-medium">
                  {getFilteredTasks(deadlineData.find(d => d.date === hoveredDate)?.tasks || []).length} tasks
                </span>
              </div>
            </div>
          </div>
          
          {/* Professional Content */}
          <div className="p-4 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {getFilteredTasks(deadlineData.find(d => d.date === hoveredDate)?.tasks || [])
                .map((task, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                    {/* Task Name */}
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-semibold text-gray-900 truncate flex-1 mr-3">
                        {task.taskName}
                      </h5>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(task.status)}
                      </div>
                    </div>
                    
                    {/* Status and Priority - Professional Layout */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {/* Professional Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">Progress</span>
                        <span className="text-xs text-gray-700 font-semibold">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
