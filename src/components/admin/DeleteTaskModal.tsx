'use client'

import { useState, useEffect } from 'react'
import { ExtendedTask } from '@/types'
import { X, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DeleteTaskModalProps {
  task: ExtendedTask
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteTaskModal({ task, onClose, onConfirm }: DeleteTaskModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isDeleting = loading
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleConfirm = async () => {
    // Show toast immediately and close modal
    toast({
      title: "Task Deleted",
      description: `Task "${task.taskName}" has been deleted successfully.`,
      variant: "destructive",
    })
    onClose()

    // Start the deletion in background
    try {
      await onConfirm()
    } catch (error) {
      console.error('Error deleting task:', error)
      // Show error toast if deletion fails
      toast({
        title: "Error",
        description: 'Failed to delete task. Please try again.',
        variant: "destructive",
      })
    }
  }

  if (!isClient) {
    return null
  }
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-transparent transition-opacity" onClick={onClose} style={{ zIndex: 9998 }} />
        
        <div 
          className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle" 
          style={{ zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Task
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{task.taskName}</strong>? 
                    This action cannot be undone.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Assigned to: {task.assignedTo?.name}
                  </p>
                  {task.status && (
                    <p className="mt-1 text-sm text-gray-500">
                      Status: <span className="font-medium">{task.status.replace('_', ' ')}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}