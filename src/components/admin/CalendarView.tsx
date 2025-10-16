'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer, Components } from 'react-big-calendar'
import moment from 'moment'
import { ExtendedUser } from '@/types'
import { format } from 'date-fns'
import { 
  UserIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import 'react-big-calendar/lib/css/react-big-calendar.css'

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

const localizer = momentLocalizer(moment)

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

export default function CalendarView() {
  const [deadlineData, setDeadlineData] = useState<DeadlineData[]>([])
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    console.log('CalendarView mounted, fetching data...')
    fetchDeadlineData()
    fetchUsers()
  }, [selectedUser, selectedStatus, selectedPriority, currentDate])

  const fetchDeadlineData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedUser) params.append('assignedTo', selectedUser)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedPriority) params.append('priority', selectedPriority)
      
      // Get current month range based on selected date
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      params.append('start', startOfMonth.toISOString())
      params.append('end', endOfMonth.toISOString())
      
      const response = await fetch(`/api/admin/calendar?${params}`)
      const data = await response.json()
      
      if (data.success) {
        console.log('Deadline data received:', data.data)
        setDeadlineData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch deadline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=100')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
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

  const components: Components = {}

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
        <div key={`header-${i}`} className="p-1 text-center text-xs font-semibold text-gray-600 bg-gray-100">
          {dayNames[i]}
        </div>
      )
    }
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-1 h-16 border border-gray-200 bg-gray-50"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dateData = deadlineData.find(d => d.date === dateString)
      const hasDeadlines = dateData && dateData.tasks.length > 0
      const isToday = day === today.getDate()
      
      days.push(
        <div 
          key={day}
          className={`p-1 h-16 border border-gray-200 cursor-pointer transition-all duration-200 ${
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
          <div className="flex flex-col h-full">
            <div className={`text-xs font-medium ${isToday ? 'text-yellow-800' : 'text-gray-900'}`}>
              {day}
            </div>
            {hasDeadlines && (
              <div className="mt-0.5 space-y-0.5">
                {dateData.tasks.slice(0, 2).map((task, index) => (
                  <div key={index} className="space-y-0.5">
                    {/* Task Name */}
                    <div
                      className={`px-1 py-0.5 rounded text-xs font-medium ${
                        task.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-700'
                          : task.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {task.taskName.length > 8 ? task.taskName.substring(0, 8) + '...' : task.taskName}
                    </div>
                    {/* User Name */}
                    <div className="px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {task.assignedTo?.name ? 
                        (task.assignedTo.name.length > 6 ? task.assignedTo.name.substring(0, 6) + '...' : task.assignedTo.name) 
                        : 'Unassigned'
                      }
                    </div>
                  </div>
                ))}
                {dateData.tasks.length > 2 && (
                  <div className="px-1 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 text-center">
                    +{dateData.tasks.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {days}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                User
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        <div className="px-4 py-4">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-sm text-gray-500">
                Hover over dates with deadlines to see task details
              </p>
              {/* Active Filters Display */}
              {(selectedUser || selectedStatus || selectedPriority) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUser && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      User: {users.find(u => u.id === selectedUser)?.name || 'Unknown'}
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Status: {selectedStatus.replace('_', ' ')}
                    </span>
                  )}
                  {selectedPriority && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Priority: {selectedPriority}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-[400px] overflow-auto">
            {deadlineData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Deadlines Found</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    No tasks with deadlines found for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    Try adjusting your filters or check if tasks have been assigned deadlines
                  </p>
                </div>
              </div>
            ) : (
              renderCustomCalendar()
            )}
          </div>
          
          {/* Debug Info */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Database Information:</h4>
            <p className="text-xs text-gray-600">Deadline entries: {deadlineData.length}</p>
            <p className="text-xs text-gray-600">Current month: {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            <p className="text-xs text-gray-600">Total tasks: {deadlineData.reduce((total, dateGroup) => total + dateGroup.tasks.length, 0)}</p>
            {deadlineData.length > 0 && (
              <p className="text-xs text-gray-600">First deadline: {deadlineData[0].date} ({deadlineData[0].tasks.length} tasks)</p>
            )}
          </div>
        </div>
      </div>

      {/* Compact Professional Hover Popup */}
      {hoveredDate && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl transform transition-all duration-200 max-w-xs"
          style={{
            left: Math.min(hoverPosition.x + 15, window.innerWidth - 350),
            top: Math.max(hoverPosition.y - 10, 10),
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">
                {format(new Date(hoveredDate), 'MMM dd')}
              </h4>
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3 text-white" />
                <span className="text-xs text-white opacity-90">
                  {deadlineData.find(d => d.date === hoveredDate)?.tasks.length || 0} tasks
                </span>
              </div>
            </div>
          </div>
          
          {/* Compact Content */}
          <div className="p-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {deadlineData
                .find(d => d.date === hoveredDate)
                ?.tasks.map((task, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-2 border border-gray-100">
                    {/* Task Name - Compact */}
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="text-xs font-medium text-gray-900 truncate flex-1 mr-2">
                        {task.taskName}
                      </h5>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(task.status)}
                      </div>
                    </div>
                    
                    {/* User Info - Compact */}
                    <div className="flex items-center space-x-1 mb-1">
                      <UserIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </div>
                    
                    {/* Status and Priority - Inline */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {/* Compact Progress */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{task.progress}%</span>
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
