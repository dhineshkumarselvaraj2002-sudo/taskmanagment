import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExtendedTask, TaskFormData } from '@/types'

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// Fetch tasks with filters
export function useTasks(filters: {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
  assignedTo?: string
} = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.search) params.set('search', filters.search)
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.assignedTo) params.set('assignedTo', filters.assignedTo)

      const response = await fetch(`/api/admin/tasks?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create task')
      }

      return response.json()
    },
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old
        
        // Create a temporary task with optimistic data
        const optimisticTask = {
          id: `temp-${Date.now()}`, // Temporary ID
          ...newTask,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: { name: 'Loading...', email: '' }, // Placeholder
          createdBy: { name: 'Loading...', email: '' }, // Placeholder
        }

        return {
          ...old,
          data: [optimisticTask, ...(old.data || [])],
          pagination: {
            ...old.pagination,
            total: (old.pagination?.total || 0) + 1
          }
        }
      })

      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      // Revert optimistic update on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, taskData }: { id: string; taskData: TaskFormData }) => {
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update task')
      }

      return response.json()
    },
    onMutate: async ({ id, taskData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.map((task: any) => 
            task.id === id 
              ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
              : task
          )
        }
      })

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete task')
      }

      return response.json()
    },
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.filter((task: any) => task.id !== taskId),
          pagination: {
            ...old.pagination,
            total: Math.max((old.pagination?.total || 1) - 1, 0)
          }
        }
      })

      return { previousTasks }
    },
    onError: (err, taskId, context) => {
      // Revert optimistic update on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
