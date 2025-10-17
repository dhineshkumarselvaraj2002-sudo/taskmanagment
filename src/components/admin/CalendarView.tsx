'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, momentLocalizer, Components } from 'react-big-calendar'
import moment from 'moment'
import { ExtendedUser } from '@/types'
import { format } from 'date-fns'
import ModernFilters from './ModernFilters'
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
  const [selectedUser, setSelectedUser] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [searchValue, setSearchValue] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('CalendarView mounted, fetching data...')
    fetchDeadlineData()
    fetchUsers()
  }, [selectedUser, selectedStatus, selectedPriority, searchValue, currentDate])


  const fetchDeadlineData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedUser && selectedUser !== 'all') params.append('assignedTo', selectedUser)
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedPriority && selectedPriority !== 'all') params.append('priority', selectedPriority)
      if (searchValue) params.append('search', searchValue)
      
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

  // Filter options
  const userOptions = [
    { value: 'all', label: 'All Users' },
    ...users.map(user => ({
      value: user.id,
      label: user.name
    }))
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'BLOCKED', label: 'Blocked' }
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
    setSelectedUser('all')
    setSelectedStatus('all')
    setSelectedPriority('all')
  }

  const handleApplyFilters = () => {
    console.log('Applying calendar filters:', {
      search: searchValue,
      user: selectedUser,
      status: selectedStatus,
      priority: selectedPriority
    })
    // Filters are already applied through useEffect
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
        return 'bg-stone-200 text-gray-700'
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
        return 'bg-stone-200 text-gray-700 border border-gray-200'
    }
  }



  const handleDateClick = (dateString: string, event: React.MouseEvent) => {
    const dateData = deadlineData.find(d => d.date === dateString)
    if (dateData && dateData.tasks.length > 0) {
      setSelectedDate(dateString)
      
      // Get the bounding rectangle of the clicked element
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      const modalHeight = 300 // Modal height
      const modalWidth = 320 // Modal width
      
      // Calculate position to ensure modal is above the date
      const x = Math.max(10, Math.min(rect.left + (rect.width / 2) - (modalWidth / 2), window.innerWidth - modalWidth - 10))
      const y = Math.max(10, rect.top - modalHeight - 15) // Position above with 15px gap
      
      setClickPosition({ x, y })
      setIsModalOpen(true)
    }
  }


  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
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

  // Navigation functions with smooth transitions
  const goToPreviousMonth = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
      setIsTransitioning(false)
    }, 150)
  }

  const goToNextMonth = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
      setIsTransitioning(false)
    }, 150)
  }

  const goToPreviousYear = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))
      setIsTransitioning(false)
    }, 150)
  }

  const goToNextYear = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))
      setIsTransitioning(false)
    }, 150)
  }

  const goToToday = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentDate(new Date())
      setIsTransitioning(false)
    }, 150)
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
    
    // Add modern day headers
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="p-3 text-center text-sm font-bold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300/50">
          {dayNames[i]}
        </div>
      )
    }
    
    // Add modern empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 h-20 border border-slate-200/50 bg-slate-50/30"></div>)
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
          className={`p-2 h-20 border border-slate-200/50 transition-all duration-300 ${
            hasDeadlines 
              ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-200/60 hover:shadow-lg cursor-pointer hover:scale-105 hover:bg-gradient-to-br hover:from-blue-100/90 hover:to-indigo-100/90' 
              : 'hover:bg-slate-50/80 cursor-default hover:shadow-sm'
          } ${isToday ? 'bg-gradient-to-br from-amber-100/90 to-yellow-100/90 border-amber-300/70 shadow-md' : ''}`}
          onClick={(e) => handleDateClick(dateString, e)}
        >
          <div className="flex items-center justify-between h-full">
            <span className={`text-sm font-bold ${isToday ? 'text-amber-800' : 'text-slate-800'}`}>
              {day}
            </span>
            {hasDeadlines && (
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className={`grid grid-cols-7 gap-0 border border-slate-200/60 rounded-2xl overflow-hidden shadow-inner bg-gradient-to-br from-slate-50/50 to-white transition-all duration-300 ${
        isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}>
        {days}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
      
      {/* Modern Filters */}
      {/* <ModernFilters
        searchPlaceholder="Search tasks by title, description, or assignee..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={{
          status: {
            options: statusOptions,
            value: selectedStatus,
            onChange: setSelectedStatus
          },
          priority: {
            options: priorityOptions,
            value: selectedPriority,
            onChange: setSelectedPriority
          },
          user: {
            options: userOptions,
            value: selectedUser,
            onChange: setSelectedUser
          }
        }}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
      /> */}

      {/* Modern Professional Calendar */}
      <div className="bg-white shadow-2xl rounded-3xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-6">
          {/* Modern Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={goToPreviousMonth}
                  className={`p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:shadow-md ${
                    isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                  }`}
                  title="Previous Month"
                  disabled={isTransitioning}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className={`text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent transition-all duration-300 ${
                  isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}>
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className={`p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:shadow-md ${
                    isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                  }`}
                  title="Next Month"
                  disabled={isTransitioning}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-600 font-medium">
                Click on dates with deadlines to view task details
              </p>
              {/* Active Filters Display */}
              {(selectedUser !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || searchValue) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchValue && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      Search: "{searchValue}"
                    </span>
                  )}
                  {selectedUser !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      User: {users.find(u => u.id === selectedUser)?.name || 'Unknown'}
                    </span>
                  )}
                  {selectedStatus !== 'all' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Status: {selectedStatus.replace('_', ' ')}
                    </span>
                  )}
                  {selectedPriority !== 'all' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Priority: {selectedPriority}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Year Navigation */}
              <button
                onClick={goToPreviousYear}
                className={`p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 ${
                  isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
                title="Previous Year"
                disabled={isTransitioning}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Month Navigation */}
              <button
                onClick={goToPreviousMonth}
                className={`p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:shadow-md ${
                  isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
                title="Previous Month"
                disabled={isTransitioning}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Today Button */}
              <button
                onClick={goToToday}
                className={`px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl transition-all duration-200 hover:shadow-md ${
                  isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
                disabled={isTransitioning}
              >
                Today
              </button>
              
              {/* Month Navigation */}
              <button
                onClick={goToNextMonth}
                className={`p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:shadow-md ${
                  isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
                title="Next Month"
                disabled={isTransitioning}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Year Navigation */}
              <button
                onClick={goToNextYear}
                className={`p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 ${
                  isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
                title="Next Year"
                disabled={isTransitioning}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-[400px] overflow-auto">
            {deadlineData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="text-slate-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No Deadlines Found</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    No tasks with deadlines found for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-500">
                    Try adjusting your filters or check if tasks have been assigned deadlines
                  </p>
                </div>
              </div>
            ) : (
              renderCustomCalendar()
            )}
          </div>
          
          {/* Debug Info */}
          {/* <div className="mt-4 p-4 bg-stone-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Database Information:</h4>
            <p className="text-xs text-gray-600">Deadline entries: {deadlineData.length}</p>
            <p className="text-xs text-gray-600">Current month: {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            <p className="text-xs text-gray-600">Total tasks: {deadlineData.reduce((total, dateGroup) => total + dateGroup.tasks.length, 0)}</p>
            {deadlineData.length > 0 && (
              <p className="text-xs text-gray-600">First deadline: {deadlineData[0].date} ({deadlineData[0].tasks.length} tasks)</p>
            )}
          </div> */}
        </div>
      </div>


      {/* Task Details Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black/30 transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Professional compact modal positioned above the clicked date */}
          <div 
            ref={modalRef}
            className="fixed bg-white/98 backdrop-blur-md rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-80 border border-slate-200/60"
            style={{
              left: clickPosition.x,
              top: clickPosition.y,
              zIndex: 60
            }}
          >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {format(new Date(selectedDate), 'MMM dd, yyyy')}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {deadlineData.find(d => d.date === selectedDate)?.tasks.length || 0} tasks due
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-3 py-3">
                <div className="space-y-2">
                  {deadlineData
                    .find(d => d.date === selectedDate)
                    ?.tasks.slice(0, 3).map((task, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-2 border border-slate-200/50">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                              {task.taskName}
                            </h4>
                            <div className="flex items-center space-x-1 mt-1">
                              <UserIcon className="h-3 w-3 text-slate-500 flex-shrink-0" />
                              <span className="text-xs text-slate-600 truncate">
                                {task.assignedTo?.name || 'Unassigned'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            {getStatusIcon(task.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  {(deadlineData.find(d => d.date === selectedDate)?.tasks.length || 0) > 3 && (
                    <div className="text-xs text-slate-500 text-center py-1 bg-slate-100 rounded-lg">
                      +{(deadlineData.find(d => d.date === selectedDate)?.tasks.length || 0) - 3} more tasks
                    </div>
                  )}
                </div>
              </div>

          </div>
        </div>
      )}
    </div>
  )
}
