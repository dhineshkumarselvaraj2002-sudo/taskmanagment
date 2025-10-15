'use client'

import { useState, useEffect } from 'react'
import { ExtendedTask, ExtendedUser, TaskFormData } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface EditTaskModalProps {
  task: ExtendedTask
  users: ExtendedUser[]
  onClose: () => void
  onSave: () => void
}

export default function EditTaskModal({ task, users, onClose, onSave }: EditTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    taskName: task.taskName,
    taskDescription: task.taskDescription,
    startDate: new Date(task.startDate),
    endDate: new Date(task.endDate),
    status: task.status,
    priority: task.priority,
    category: task.category || '',
    tags: task.tags || [],
    estimatedHours: task.estimatedHours || 0,
    assignedToId: task.assignedToId,
    checklistItems: task.checklistItems?.map(item => ({
      title: item.title,
      isCompleted: item.isCompleted
    })) || []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onSave()
        onClose()
      } else {
        setError(data.error || 'Failed to update task')
      }
    } catch (error) {
      setError('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Task</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  suppressHydrationWarning
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taskName" className="block text-sm font-medium text-gray-700">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      name="taskName"
                      id="taskName"
                      required
                      value={formData.taskName}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>

                  <div>
                    <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">
                      Assign To *
                    </label>
                    <select
                      name="assignedToId"
                      id="assignedToId"
                      required
                      value={formData.assignedToId}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      suppressHydrationWarning
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="taskDescription"
                    id="taskDescription"
                    rows={3}
                    value={formData.taskDescription}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    suppressHydrationWarning
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      required
                      value={formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      required
                      value={formData.endDate instanceof Date ? formData.endDate.toISOString().split('T')[0] : formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      suppressHydrationWarning
                    >
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
                      name="priority"
                      id="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      suppressHydrationWarning
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      name="estimatedHours"
                      id="estimatedHours"
                      min="0"
                      value={formData.estimatedHours}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    placeholder="urgent, frontend, bug"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    suppressHydrationWarning
                  />
                </div>

                {/* Checklist Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Checklist Items
                    </label>
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                      suppressHydrationWarning
                    >
                      + Add Item
                    </button>
                  </div>
                  {formData.checklistItems?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={(e) => updateChecklistItem(index, 'isCompleted', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        suppressHydrationWarning
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateChecklistItem(index, 'title', e.target.value)}
                        placeholder="Checklist item"
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        suppressHydrationWarning
                      />
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="text-red-600 hover:text-red-500"
                        suppressHydrationWarning
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                suppressHydrationWarning
              >
                {loading ? 'Updating...' : 'Update Task'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                suppressHydrationWarning
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
