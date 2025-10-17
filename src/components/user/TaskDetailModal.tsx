'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Play,
  Tag
} from 'lucide-react'
import { ExtendedTask, TaskStatus } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: ExtendedTask | null
  onStatusUpdate?: (taskId: string, newStatus: TaskStatus) => void
}

export default function TaskDetailModal({ isOpen, onClose, task, onStatusUpdate }: TaskDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task?.status || 'TODO')
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  // Update selectedStatus when task changes
  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status)
    }
  }, [task])

  if (!isOpen || !task) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'TODO': return 'bg-stone-200 text-gray-800 border-gray-200'
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200'
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED': return 'bg-stone-200 text-gray-800 border-gray-200'
      default: return 'bg-stone-200 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-stone-200 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'IN_PROGRESS': return <Play className="w-4 h-4" />
      case 'TODO': return <Clock className="w-4 h-4" />
      case 'BLOCKED': return <XCircle className="w-4 h-4" />
      case 'IN_REVIEW': return <AlertCircle className="w-4 h-4" />
      case 'CANCELLED': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertCircle className="w-4 h-4" />
      case 'HIGH': return <AlertCircle className="w-4 h-4" />
      case 'MEDIUM': return <Clock className="w-4 h-4" />
      case 'LOW': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleStatusUpdate = async () => {
    if (selectedStatus === task.status) return

    console.log('🔄 Status Update Debug:', {
      currentStatus: task.status,
      selectedStatus,
      isUpdating,
      taskId: task.id
    })

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/user/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          onStatusUpdate?.(task.id, selectedStatus)
          // Dispatch event to refresh notifications immediately
          console.log('TaskDetailModal - Dispatching taskStatusChanged event')
          window.dispatchEvent(new CustomEvent('taskStatusChanged', { 
            detail: { taskId: task.id, newStatus: selectedStatus } 
          }))
          toast({
            title: "Success!",
            description: "Task status updated successfully!",
            variant: "success"
          })
          // Close the modal after successful update
          onClose()
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to update task status",
            variant: "destructive"
          })
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update task status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = new Date(task.endDate) < new Date() && task.status !== 'COMPLETED'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Professional backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" 
        onClick={onClose}
      />
      
      {/* Professional Modal Content */}
      <div 
        className="relative transform overflow-hidden rounded-xl bg-white border border-gray-200 shadow-2xl transition-all duration-300 w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Professional Header */}
        <div className="bg-white px-8 py-6 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2bg-stone-2000 rounded-full"></div>
                <h2 className="text-2xl font-semibold text-gray-900 truncate">
                  {task.taskName}
                </h2>
              </div>
              <p className="text-sm text-gray-500">Task Details & Status Management</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-stone-200 rounded-lg transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Professional Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {/* Status and Priority Section */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Badge className={`${getStatusColor(task.status)} border-0 px-3 py-1.5 text-sm font-medium flex items-center gap-2`}>
                    {getStatusIcon(task.status)}
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <Badge className={`${getPriorityColor(task.priority)} border-0 px-3 py-1.5 text-sm font-medium flex items-center gap-2`}>
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                </div>
                {isOverdue && (
                  <Badge className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="bg-stone-200 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{task.taskDescription}</p>
              </div>
            </div>

            {/* Task Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Start Date:</span>
                      <p className="text-sm font-medium text-gray-900">{formatDate(task.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(task.endDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="text-sm font-medium text-gray-900">{formatDate(task.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Estimated Hours:</span>
                      <p className="text-sm font-medium text-gray-900">{task.estimatedHours || 'Not specified'} hours</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <p className="text-sm font-medium text-gray-900">{formatDate(task.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    Assignment
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Assigned To:</span>
                      <p className="text-sm font-medium text-gray-900">{task.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created By:</span>
                      <p className="text-sm font-medium text-gray-900">{task.createdBy?.name || 'Unknown'}</p>
                    </div>
                    {task.category && (
                      <div>
                        <span className="text-sm text-gray-600">Category:</span>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {task.category}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {task.tags && task.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-3 py-1.5bg-stone-200 text-blue-700 text-sm font-medium rounded-lg border border-blue-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status Update Section */}
            <div className="bg-stone-200 border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Task Status</h3>
                <p className="text-sm text-gray-600">Change the status of this task. Admin will be notified of status changes.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status: <span className="text-gray-900">{task.status.replace('_', ' ')}</span>
                  </label>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={(value: TaskStatus) => {
                      console.log('📋 Dropdown Selection Debug:', {
                        previousStatus: selectedStatus,
                        newStatus: value,
                        taskId: task.id
                      })
                      setSelectedStatus(value)
                    }}
                  >
                    <SelectTrigger 
                      id="status-select" 
                      className="w-full h-11 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                    >
                      <SelectValue placeholder="Select new status">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedStatus)}
                          <span className="font-medium">{selectedStatus.replace('_', ' ')}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[10000] bg-white border border-gray-200 rounded-lg shadow-lg">
                      <SelectItem 
                        value="TODO" 
                        className="cursor-pointer hover:bg-stone-200 focus:bg-stone-200 py-3 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <span className="font-medium">To Do</span>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="IN_PROGRESS" 
                        className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-3 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-fullbg-stone-2000"></div>
                          <span className="font-medium">In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="IN_REVIEW" 
                        className="cursor-pointer hover:bg-yellow-50 focus:bg-yellow-50 py-3 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">In Review</span>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="COMPLETED" 
                        className="cursor-pointer hover:bg-green-50 focus:bg-green-50 py-3 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">Completed</span>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="BLOCKED" 
                        className="cursor-pointer hover:bg-red-50 focus:bg-red-50 py-3 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="font-medium">Blocked</span>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="CANCELLED" 
                        className="cursor-pointer hover:bg-stone-200 focus:bg-stone-200 py-3 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-stone-2000"></div>
                          <span className="font-medium">Cancelled</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:mt-6">
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={selectedStatus === task.status || isUpdating}
                    className={`h-11 px-6 transition-all duration-200 ${
                      selectedStatus !== task.status 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isUpdating ? 'Updating...' : 
                     selectedStatus !== task.status ? 'Update Status' : 'No Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="bg-white border-t border-gray-200 px-8 py-4 flex justify-end items-center flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-stone-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
