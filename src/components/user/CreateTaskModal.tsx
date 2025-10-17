'use client'

import { useState } from 'react'
import { X, Plus, Calendar, Clock, AlertCircle } from 'lucide-react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    taskName: '',
    taskDescription: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'MEDIUM',
    category: '',
    estimatedHours: 8,
    checklistItems: [] as { title: string; isCompleted: boolean }[]
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        // Dispatch event to refresh notifications immediately
        console.log('CreateTaskModal - Dispatching taskCreated event')
        window.dispatchEvent(new CustomEvent('taskCreated', { 
          detail: { taskId: data.data.id, taskName: formData.taskName } 
        }))
        setTimeout(() => {
          onClose()
          setSuccess(false)
          // Reset form
          setFormData({
            taskName: '',
            taskDescription: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'MEDIUM',
            category: '',
            estimatedHours: 8,
            checklistItems: []
          })
        }, 2000)
      } else {
        alert(data.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, { title: '', isCompleted: false }]
    }))
  }

  const updateChecklistItem = (index: number, title: string) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) => 
        i === index ? { ...item, title } : item
      )
    }))
  }

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-stone-2000 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Create New Task</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 max-h-96 overflow-y-auto">
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm font-medium text-green-800">
                      Task created successfully!
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.taskName}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Enter task name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.taskDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Describe your task"
                  />
                </div>

                {/* Date and Priority Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Category and Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g., Development, Design"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Checklist Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Checklist Items
                    </label>
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  
                  {formData.checklistItems.length > 0 && (
                    <div className="space-y-2">
                      {formData.checklistItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateChecklistItem(index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Checklist item"
                          />
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-stone-200 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
