'use client'

import { useState, useEffect } from 'react'
import { TaskFormData, ExtendedUser } from '@/types'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCreateTask } from '@/hooks/use-tasks'
import { useUsers } from '@/hooks/use-users'

interface CreateTaskModalProps {
  onClose?: () => void
  onSave?: () => void
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Task name and assignment' },
  { id: 2, title: 'Details', description: 'Description and timeline' },
  { id: 3, title: 'Settings', description: 'Status, priority and category' },
  { id: 4, title: 'Checklist', description: 'Additional items and tags' }
]

export default function CreateTaskModal({ onClose, onSave }: CreateTaskModalProps) {
  const { toast } = useToast()
  const createTaskMutation = useCreateTask()
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 100 })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<TaskFormData>({
    taskName: '',
    taskDescription: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'TODO',
    priority: 'MEDIUM',
    category: '',
    tags: [],
    estimatedHours: 0,
    assignedToId: '',
    checklistItems: []
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
  const [error, setError] = useState('')
  const users = usersData?.data || []
  const loading = createTaskMutation.isPending
  const isCreating = createTaskMutation.isPending

  // Step navigation functions
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const goToStep = (step: number) => {
    if (step <= currentStep || validateCurrentStep()) {
      setCurrentStep(step)
    }
  }

  // Step validation
  const validateCurrentStep = () => {
    setError('')
    
    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.taskName.trim()) {
          setError('Task name is required')
          return false
        }
        if (!formData.assignedToId) {
          setError('Please assign the task to a user')
          return false
        }
        return true
      
      case 2: // Details
        if (formData.startDate >= formData.endDate) {
          setError('End date must be after start date')
          return false
        }
        return true
      
      case 3: // Settings
        return true // No specific validation for this step
      
      case 4: // Checklist
        return true // No specific validation for this step
      
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Final validation before submission
    if (!formData.taskName.trim()) {
      setError('Task name is required')
      return
    }

    if (!formData.assignedToId) {
      setError('Please assign the task to a user')
      return
    }

    if (formData.startDate >= formData.endDate) {
      setError('End date must be after start date')
      return
    }

    // Start the mutation and wait for it to complete
    createTaskMutation.mutate(formData, {
      onSuccess: () => {
        // Show success toast and close modal only after successful creation
        toast({
          title: "Task Created Successfully",
          description: `Task "${formData.taskName}" has been created successfully.`,
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        onSave?.()
        onClose?.()
      },
      onError: (error: any) => {
        // Show error toast if mutation fails
        setError(error.message || 'Failed to create task')
        toast({
          title: "Error",
          description: error.message || 'Failed to create task',
          variant: "destructive",
        })
      }
    })
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      nextStep()
    } else {
      // If on last step, submit the form
      handleSubmit(new Event('submit') as any)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({ ...prev, tags }))
  }

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklistItems: [...(prev.checklistItems || []), { title: '', isCompleted: false }]
    }))
  }

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems?.filter((_, i) => i !== index) || []
    }))
  }

  const updateChecklistItem = (index: number, field: 'title' | 'isCompleted', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }))
  }

  // Step components
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="taskName" className="block text-sm font-semibold text-gray-900 mb-3">
                  Task Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="taskName"
                    id="taskName"
                    required
                    value={formData.taskName}
                    onChange={handleChange}
                    className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Enter a descriptive task name"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                </div>
              </div>

              <div>
                <label htmlFor="assignedToId" className="block text-sm font-semibold text-gray-900 mb-3">
                  Assign To *
                </label>
                <div className="relative">
                  <select
                    name="assignedToId"
                    id="assignedToId"
                    required
                    value={formData.assignedToId}
                    onChange={handleChange}
                    className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Choose a team member</option>
                    {users.map((user: ExtendedUser) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="taskDescription" className="block text-sm font-semibold text-gray-900 mb-3">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    name="taskDescription"
                    id="taskDescription"
                    rows={4}
                    value={formData.taskDescription}
                    onChange={handleChange}
                    className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400 resize-none"
                    placeholder="Describe the task details and requirements..."
                    suppressHydrationWarning
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-3">
                    Start Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      required
                      value={isClient ? (formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : formData.startDate) : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                      className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                  </div>
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-3">
                    Due Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      required
                      value={isClient ? (formData.endDate instanceof Date ? formData.endDate.toISOString().split('T')[0] : formData.endDate) : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                      className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-3">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-3">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      id="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="estimatedHours" className="block text-sm font-semibold text-gray-900 mb-3">
                    Estimated Hours
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="estimatedHours"
                      id="estimatedHours"
                      min="0"
                      value={formData.estimatedHours}
                      onChange={handleChange}
                      className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                      placeholder="0"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-3">
                    Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                      placeholder="e.g., Development, Design, Marketing"
                      suppressHydrationWarning
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-semibold text-gray-900 mb-3">
                    Tags
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={handleTagsChange}
                      placeholder="urgent, frontend, bug"
                      className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                      suppressHydrationWarning
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Checklist Items</h4>
                  <p className="text-sm text-gray-500 mt-1">Break down the task into smaller, manageable items</p>
                </div>
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200 hover:shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Item</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.checklistItems?.map((item, index) => (
                  <div key={index} className="group flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all duration-200">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={(e) => updateChecklistItem(index, 'isCompleted', e.target.checked)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg transition-all duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateChecklistItem(index, 'title', e.target.value)}
                        placeholder="Enter checklist item..."
                        className="w-full px-3 py-2 text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {(!formData.checklistItems || formData.checklistItems.length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No checklist items yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Add items to break down your task into smaller steps</p>
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add First Item</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Modern backdrop with enhanced blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" 
        onClick={onClose}
      />
      
      {/* Modern Modal Content with glassmorphism */}
      <div 
        className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 w-full max-w-5xl max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Modern Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-8 pt-8 pb-6 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Create New Task
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                    Step {currentStep} of {STEPS.length}
                  </span>
                  <span className="text-sm text-gray-600">{STEPS[currentStep - 1]?.title}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="group rounded-xl p-3 text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200 hover:shadow-lg"
              >
                <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Modern Progress Steps */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center space-y-3">
                    <button
                      type="button"
                      onClick={() => goToStep(step.id)}
                      className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                        currentStep === step.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                          : currentStep > step.id
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </button>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{step.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Modern Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="mx-8 mb-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Modern Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8">
            <div className="py-8">
              <div className="max-w-2xl mx-auto">
                {renderStepContent()}
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border-t border-gray-200/50 px-8 py-6 flex justify-between items-center flex-shrink-0">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="group flex items-center space-x-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-semibold text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/80 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isCreating}
                className="group flex items-center space-x-2 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                suppressHydrationWarning
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === STEPS.length ? 'Create Task' : 'Next'}</span>
                    {currentStep < STEPS.length && <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                  </>
                )}
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
  )
}
