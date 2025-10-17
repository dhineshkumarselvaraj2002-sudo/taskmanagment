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
  Tag,
  FileText,
  MessageSquare,
  Paperclip
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
      case 'TODO': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200'
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      {/* Modern backdrop with enhanced blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" 
        onClick={onClose}
      />
      
      {/* Modern Modal Content with glassmorphism */}
      <div 
        className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 w-full max-w-4xl max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-8 pt-8 pb-6 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {task.taskName}
              </h2>
              <p className="text-gray-600">Task Details</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="group rounded-xl p-3 text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200 hover:shadow-lg"
            >
              <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Modern Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8">
          <div className="py-8">
            <div className="max-w-2xl mx-auto space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label className="font-medium">Status:</Label>
              <Badge className={`${getStatusColor(task.status)} border flex items-center gap-1`}>
                {getStatusIcon(task.status)}
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-medium">Priority:</Label>
              <Badge className={`${getPriorityColor(task.priority)} border flex items-center gap-1`}>
                {getPriorityIcon(task.priority)}
                {task.priority}
              </Badge>
            </div>
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="font-medium text-gray-900 mb-2 block">Description</Label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{task.taskDescription}</p>
            </div>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-gray-900 mb-2 block">Due Date</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                    {formatDate(task.endDate)}
                  </span>
                </div>
              </div>

              <div>
                <Label className="font-medium text-gray-900 mb-2 block">Start Date</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(task.startDate)}</span>
                </div>
              </div>

              <div>
                <Label className="font-medium text-gray-900 mb-2 block">Estimated Hours</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{task.estimatedHours || 'Not specified'} hours</span>
                </div>
              </div>

              <div>
                <Label className="font-medium text-gray-900 mb-2 block">Created Date</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(task.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-gray-900 mb-2 block">Assigned To</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <Label className="font-medium text-gray-900 mb-2 block">Created By</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{task.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>

              {task.category && (
                <div>
                  <Label className="font-medium text-gray-900 mb-2 block">Category</Label>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span>{task.category}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="font-medium text-gray-900 mb-2 block">Last Updated</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(task.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <Label className="font-medium text-gray-900 mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status Update Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
              <CardDescription>
                Change the status of this task. Admin will be notified of status changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="status-select" className="font-medium text-gray-900 mb-2 block">
                    Current Status: {task.status.replace('_', ' ')}
                  </Label>
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
                      className="w-full h-12 bg-white border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm rounded-lg transition-all duration-200"
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
                        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-3 px-4"
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
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
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
                        className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-3 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span className="font-medium">Cancelled</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={selectedStatus === task.status || isUpdating}
                  className={`mt-6 transition-all duration-200 ${
                    selectedStatus !== task.status 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isUpdating ? 'Updating...' : 
                   selectedStatus !== task.status ? 'Update Status' : 'No Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Comments</p>
                <p className="text-sm text-gray-600">{task.comments?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Paperclip className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Attachments</p>
                <p className="text-sm text-gray-600">{task.attachments?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time Logs</p>
                <p className="text-sm text-gray-600">{task.timeLogs?.length || 0}</p>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border-t border-gray-200/50 px-8 py-6 flex justify-end items-center flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/80 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
