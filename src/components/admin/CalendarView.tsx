'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer, Components } from 'react-big-calendar'
import moment from 'moment'
import { CalendarEvent, ExtendedUser } from '@/types'
import { format } from 'date-fns'
import { 
  UserIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Custom styles for modern calendar design
const calendarStyles = `
  .modern-calendar .rbc-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    padding: 12px 8px;
    border: none;
    font-size: 14px;
  }
  
  .modern-calendar .rbc-month-view {
    border: none;
  }
  
  .modern-calendar .rbc-date-cell {
    padding: 8px;
    border: none;
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
  
  .modern-calendar .rbc-button-link {
    color: #374151;
    font-weight: 500;
    transition: all 0.2s ease;
    border-radius: 6px;
    padding: 4px 8px;
  }
  
  .modern-calendar .rbc-button-link:hover {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    color: #3730a3;
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
`

const localizer = momentLocalizer(moment)

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetchEvents()
    fetchUsers()
  }, [selectedUser, selectedStatus, selectedPriority])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedUser) params.append('assignedTo', selectedUser)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedPriority) params.append('priority', selectedPriority)
      
      // Get current month range
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      params.append('start', startOfMonth.toISOString())
      params.append('end', endOfMonth.toISOString())
      
      const response = await fetch(`/api/admin/calendar?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
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

  const getEventStyle = (event: CalendarEvent) => {
    const task = event.resource.task
    let backgroundColor = '#3174ad'
    
    switch (task.status) {
      case 'COMPLETED':
        backgroundColor = '#10B981'
        break
      case 'IN_PROGRESS':
        backgroundColor = '#3B82F6'
        break
      case 'IN_REVIEW':
        backgroundColor = '#F59E0B'
        break
      case 'BLOCKED':
        backgroundColor = '#EF4444'
        break
      case 'TODO':
        backgroundColor = '#6B7280'
        break
    }

    switch (task.priority) {
      case 'CRITICAL':
        backgroundColor = '#DC2626'
        break
      case 'HIGH':
        backgroundColor = '#EA580C'
        break
      case 'MEDIUM':
        backgroundColor = '#D97706'
        break
      case 'LOW':
        backgroundColor = '#059669'
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleMouseEnter = (event: CalendarEvent, e: React.MouseEvent) => {
    setHoveredEvent(event)
    setHoverPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredEvent(null)
  }

  // Custom Event Component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div
        className="h-full w-full p-1 text-xs cursor-pointer rounded-md transition-all duration-200 hover:shadow-md"
        onMouseEnter={(e) => handleMouseEnter(event, e)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleSelectEvent(event)}
      >
        <div className="truncate font-medium text-white">{event.title}</div>
        <div className="truncate opacity-90 text-white">
          {event.resource.task.assignedTo?.name}
        </div>
      </div>
    )
  }

  const components: Components = {
    event: EventComponent
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

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
        </div>
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

      {/* Enhanced Calendar */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-6">
          <div className="h-[500px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ 
                height: '100%',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
              eventPropGetter={getEventStyle}
              onSelectEvent={handleSelectEvent}
              views={['month', 'week', 'day']}
              defaultView="month"
              popup
              components={components}
              className="modern-calendar"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Hover Popup */}
      {hoveredEvent && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-5 max-w-xs transform transition-all duration-200"
          style={{
            left: Math.min(hoverPosition.x + 15, window.innerWidth - 300),
            top: Math.max(hoverPosition.y - 20, 10),
            pointerEvents: 'none',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 -m-5 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white truncate">
                {hoveredEvent.resource.task.taskName}
              </h4>
              <div className="flex items-center space-x-1">
                {getStatusIcon(hoveredEvent.resource.task.status)}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Assigned to</p>
                <p className="text-sm font-semibold text-gray-900">
                  {hoveredEvent.resource.task.assignedTo?.name}
                </p>
              </div>
            </div>
            
            {/* Due Date */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <ClockIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Due Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(hoveredEvent.resource.task.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            {/* Status and Priority */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  hoveredEvent.resource.task.priority === 'CRITICAL'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : hoveredEvent.resource.task.priority === 'HIGH'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : hoveredEvent.resource.task.priority === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {hoveredEvent.resource.task.priority}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  hoveredEvent.resource.task.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : hoveredEvent.resource.task.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-700'
                    : hoveredEvent.resource.task.status === 'IN_REVIEW'
                    ? 'bg-yellow-100 text-yellow-700'
                    : hoveredEvent.resource.task.status === 'BLOCKED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {hoveredEvent.resource.task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{hoveredEvent.resource.task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${hoveredEvent.resource.task.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedEvent(null)} />
            
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Task Details</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedEvent.resource.task.taskName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedEvent.resource.task.taskDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned To</label>
                      <div className="flex items-center mt-1">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {selectedEvent.resource.task.assignedTo?.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedEvent.resource.task.status)}
                        <span className="text-sm text-gray-900 ml-2">
                          {selectedEvent.resource.task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <div className="mt-1">
                        <span className={`text-sm font-medium ${getPriorityColor(selectedEvent.resource.task.priority)}`}>
                          {selectedEvent.resource.task.priority}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Due Date</label>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedEvent.resource.task.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.resource.task.tags && selectedEvent.resource.task.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tags</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedEvent.resource.task.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.resource.task.checklistItems && selectedEvent.resource.task.checklistItems.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Checklist</label>
                      <div className="mt-1 space-y-1">
                        {selectedEvent.resource.task.checklistItems.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              readOnly
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className={`ml-2 text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
