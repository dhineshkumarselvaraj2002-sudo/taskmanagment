import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExtendedTask, TaskFormData } from '@/types'

// Query keys
export const userTaskKeys = {
  all: ['user-tasks'] as const,
  lists: () => [...userTaskKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userTaskKeys.lists(), { filters }] as const,
  details: () => [...userTaskKeys.all, 'detail'] as const,
  detail: (id: string) => [...userTaskKeys.details(), id] as const,
}

// Fetch user tasks with filters
export function useUserTasks(filters: {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
} = {}) {
  return useQuery({
    queryKey: userTaskKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.search) params.set('search', filters.search)
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)

      const response = await fetch(`/api/user/tasks?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Create user task mutation
export function useCreateUserTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const response = await fetch('/api/user/tasks', {
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
      await queryClient.cancelQueries({ queryKey: userTaskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: userTaskKeys.lists() })

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: userTaskKeys.lists() }, (old: any) => {
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
      queryClient.invalidateQueries({ queryKey: userTaskKeys.lists() })
    },
  })
}

// Update user task mutation
export function useUpdateUserTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, taskData }: { id: string; taskData: TaskFormData }) => {
      const response = await fetch(`/api/user/tasks/${id}`, {
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
      await queryClient.cancelQueries({ queryKey: userTaskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: userTaskKeys.lists() })

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: userTaskKeys.lists() }, (old: any) => {
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
      queryClient.invalidateQueries({ queryKey: userTaskKeys.lists() })
    },
  })
}

// Update task status mutation
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/user/tasks/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update task status')
      }

      return response.json()
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userTaskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: userTaskKeys.lists() })

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: userTaskKeys.lists() }, (old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.map((task: any) => 
            task.id === id 
              ? { ...task, status, updatedAt: new Date().toISOString() }
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
      queryClient.invalidateQueries({ queryKey: userTaskKeys.lists() })
    },
  })
}
