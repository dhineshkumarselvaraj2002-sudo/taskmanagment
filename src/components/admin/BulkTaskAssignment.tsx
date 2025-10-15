'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Calendar, AlertCircle } from 'lucide-react'
import { ExtendedUser } from '@/types'

interface TaskTemplate {
  taskName: string
  taskDescription: string
  startDate: string
  endDate: string
  status: string
  priority: string
  category?: string
  tags: string[]
  estimatedHours?: number
  checklistItems?: { title: string; isCompleted: boolean }[]
}

export default function BulkTaskAssignment() {
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [tasks, setTasks] = useState<TaskTemplate[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=100')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data.filter((user: ExtendedUser) => user.role === 'USER'))
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const addTask = () => {
    setTasks([...tasks, {
      taskName: '',
      taskDescription: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'TODO',
      priority: 'MEDIUM',
      category: '',
      tags: [],
      estimatedHours: 8,
      checklistItems: []
    }])
  }

  const updateTask = (index: number, field: keyof TaskTemplate, value: any) => {
    const updatedTasks = [...tasks]
    updatedTasks[index] = { ...updatedTasks[index], [field]: value }
    setTasks(updatedTasks)
  }

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const addChecklistItem = (taskIndex: number) => {
    const updatedTasks = [...tasks]
    if (!updatedTasks[taskIndex].checklistItems) {
      updatedTasks[taskIndex].checklistItems = []
    }
    updatedTasks[taskIndex].checklistItems!.push({
      title: '',
      isCompleted: false
    })
    setTasks(updatedTasks)
  }

  const updateChecklistItem = (taskIndex: number, itemIndex: number, title: string) => {
    const updatedTasks = [...tasks]
    if (updatedTasks[taskIndex].checklistItems) {
      updatedTasks[taskIndex].checklistItems![itemIndex].title = title
      setTasks(updatedTasks)
    }
  }

  const removeChecklistItem = (taskIndex: number, itemIndex: number) => {
    const updatedTasks = [...tasks]
    if (updatedTasks[taskIndex].checklistItems) {
      updatedTasks[taskIndex].checklistItems = updatedTasks[taskIndex].checklistItems!.filter((_, i) => i !== itemIndex)
      setTasks(updatedTasks)
    }
  }

  const handleSubmit = async () => {
    if (selectedUsers.length === 0 || tasks.length === 0) {
      alert('Please select users and add at least one task')
      return
    }

    // Validate tasks
    const invalidTasks = tasks.filter(task => 
      !task.taskName.trim() || !task.taskDescription.trim()
    )
    
    if (invalidTasks.length > 0) {
      alert('Please fill in all required task fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/tasks/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks,
          userIds: selectedUsers
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          setTasks([])
          setSelectedUsers([])
        }, 2000)
      } else {
        alert(data.error || 'Failed to assign tasks')
      }
    } catch (error) {
      console.error('Failed to assign tasks:', error)
      alert('Failed to assign tasks')
    } finally {
      setLoading(false)
    }
  }

  const calculateTasksPerUser = () => {
    if (selectedUsers.length === 0 || tasks.length === 0) return 0
    return Math.floor(tasks.length / selectedUsers.length)
  }

  const getRemainingTasks = () => {
    const tasksPerUser = calculateTasksPerUser()
    return tasks.length - (tasksPerUser * selectedUsers.length)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Users className="h-4 w-4 mr-2" />
        Bulk Assign Tasks
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)} />
            
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Bulk Task Assignment</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="h-6 w-6" />
                  </button>
                </div>

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Tasks assigned successfully! Each user will receive 2 tasks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users (Each will receive 2 tasks)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {users.map((user) => (
                      <label key={user.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">{user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Task Templates */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Task Templates
                    </label>
                    <button
                      onClick={addTask}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Task {taskIndex + 1}</h4>
                          <button
                            onClick={() => removeTask(taskIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Task Name *</label>
                            <input
                              type="text"
                              value={task.taskName}
                              onChange={(e) => updateTask(taskIndex, 'taskName', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Enter task name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                              value={task.priority}
                              onChange={(e) => updateTask(taskIndex, 'priority', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="CRITICAL">Critical</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                              type="date"
                              value={task.startDate}
                              onChange={(e) => updateTask(taskIndex, 'startDate', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                              type="date"
                              value={task.endDate}
                              onChange={(e) => updateTask(taskIndex, 'endDate', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description *</label>
                            <textarea
                              value={task.taskDescription}
                              onChange={(e) => updateTask(taskIndex, 'taskDescription', e.target.value)}
                              rows={3}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Enter task description"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                            <input
                              type="number"
                              value={task.estimatedHours || ''}
                              onChange={(e) => updateTask(taskIndex, 'estimatedHours', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="8"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input
                              type="text"
                              value={task.category || ''}
                              onChange={(e) => updateTask(taskIndex, 'category', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="e.g., Development, Design"
                            />
                          </div>
                        </div>

                        {/* Checklist Items */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Checklist Items</label>
                            <button
                              onClick={() => addChecklistItem(taskIndex)}
                              className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              + Add Item
                            </button>
                          </div>
                          {task.checklistItems && task.checklistItems.length > 0 && (
                            <div className="space-y-2">
                              {task.checklistItems.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateChecklistItem(taskIndex, itemIndex, e.target.value)}
                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Checklist item"
                                  />
                                  <button
                                    onClick={() => removeChecklistItem(taskIndex, itemIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {selectedUsers.length > 0 && tasks.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Assignment Summary</h4>
                    <div className="text-sm text-blue-800">
                      <p>• {selectedUsers.length} users selected</p>
                      <p>• {tasks.length} task templates</p>
                      <p>• {calculateTasksPerUser()} tasks per user</p>
                      {getRemainingTasks() > 0 && (
                        <p>• {getRemainingTasks()} tasks will be distributed among first {getRemainingTasks()} users</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedUsers.length === 0 || tasks.length === 0}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {loading ? 'Assigning...' : 'Assign Tasks'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
