import { Suspense } from "react"
import { TaskList } from "@/components/tasks/task-list"
import { TaskFilters } from "@/components/tasks/task-filters"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Grid, List, Kanban } from "lucide-react"
import Link from "next/link"

export default function AdminTasks() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track all tasks in your system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button asChild>
            <Link href="/admin/tasks/new">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<FiltersSkeleton />}>
        <TaskFilters />
      </Suspense>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button variant="outline" size="sm">
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button variant="outline" size="sm">
            <Kanban className="h-4 w-4 mr-2" />
            Kanban
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Showing 1-10 of 25 tasks
        </div>
      </div>

      {/* Task List */}
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskList />
      </Suspense>
    </div>
  )
}

// Loading Skeletons
function FiltersSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
      <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}