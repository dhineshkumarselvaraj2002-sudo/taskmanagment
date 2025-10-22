import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { userTaskKeys } from './use-user-tasks'

/**
 * Custom hook to listen for admin task operations and automatically update user task data
 * This ensures that when an admin creates, updates, or deletes tasks, user interfaces
 * automatically reflect those changes without manual refresh
 */
export function useAdminTaskEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Listen for admin task creation events
    const handleAdminTaskCreated = (event: CustomEvent) => {
      const { taskId, taskName, assignedToId, task } = event.detail
      console.log('Admin task created event received:', { taskId, taskName, assignedToId })
      
      // Invalidate user task queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: userTaskKeys.lists() })
      
      // If the task is assigned to a specific user, we could also optimistically update
      // their cache if we have the user ID context
      if (assignedToId && task) {
        queryClient.setQueriesData({ queryKey: userTaskKeys.lists() }, (old: any) => {
          if (!old?.data) return old
          
          // Add the new task to the beginning of the list
          return {
            ...old,
            data: [task, ...old.data],
            pagination: {
              ...old.pagination,
              total: (old.pagination?.total || 0) + 1
            }
          }
        })
      }
    }

    // Listen for admin task update events
    const handleAdminTaskUpdated = (event: CustomEvent) => {
      const { taskId, taskName, assignedToId, task, isUserModal } = event.detail
      console.log('Admin task updated event received:', { taskId, taskName, assignedToId, isUserModal })
      
      // Don't update if this was a user modal operation (to avoid double updates)
      if (isUserModal) {
        console.log('Skipping update - this was a user modal operation')
        return
      }
      
      // Invalidate user task queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: userTaskKeys.lists() })
      
      // Optimistically update the cache if we have the updated task data
      if (task) {
        queryClient.setQueriesData({ queryKey: userTaskKeys.lists() }, (old: any) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.map((existingTask: any) => 
              existingTask.id === taskId 
                ? { ...existingTask, ...task, updatedAt: new Date().toISOString() }
                : existingTask
            )
          }
        })
      }
    }

    // Listen for admin task deletion events
    const handleAdminTaskDeleted = (event: CustomEvent) => {
      const { taskId, taskName, assignedToId } = event.detail
      console.log('Admin task deleted event received:', { taskId, taskName, assignedToId })
      
      // Invalidate user task queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: userTaskKeys.lists() })
      
      // Optimistically remove the task from cache
      queryClient.setQueriesData({ queryKey: userTaskKeys.lists() }, (old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.filter((task: any) => task.id !== taskId),
          pagination: {
            ...old.pagination,
            total: Math.max((old.pagination?.total || 0) - 1, 0)
          }
        }
      })
    }

    // Add event listeners
    window.addEventListener('adminTaskCreated', handleAdminTaskCreated as EventListener)
    window.addEventListener('adminTaskUpdated', handleAdminTaskUpdated as EventListener)
    window.addEventListener('adminTaskDeleted', handleAdminTaskDeleted as EventListener)

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('adminTaskCreated', handleAdminTaskCreated as EventListener)
      window.removeEventListener('adminTaskUpdated', handleAdminTaskUpdated as EventListener)
      window.removeEventListener('adminTaskDeleted', handleAdminTaskDeleted as EventListener)
    }
  }, [queryClient])
}

/**
 * Enhanced hook that also listens for task status changes from users
 * This ensures admin interfaces are updated when users change task status
 */
export function useUserTaskEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Listen for user task status changes
    const handleTaskStatusChanged = (event: CustomEvent) => {
      const { taskId, newStatus } = event.detail
      console.log('Task status changed event received:', { taskId, newStatus })
      
      // Invalidate admin task queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.map((task: any) => 
            task.id === taskId 
              ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
              : task
          )
        }
      })
    }

    // Listen for user task creation
    const handleTaskCreated = (event: CustomEvent) => {
      const { taskId, taskName } = event.detail
      console.log('Task created event received:', { taskId, taskName })
      
      // Invalidate admin task queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }

    // Add event listeners
    window.addEventListener('taskStatusChanged', handleTaskStatusChanged as EventListener)
    window.addEventListener('taskCreated', handleTaskCreated as EventListener)

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('taskStatusChanged', handleTaskStatusChanged as EventListener)
      window.removeEventListener('taskCreated', handleTaskCreated as EventListener)
    }
  }, [queryClient])
}

