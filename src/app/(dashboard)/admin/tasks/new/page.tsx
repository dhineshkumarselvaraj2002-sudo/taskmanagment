import { Suspense } from "react"
import { TaskForm } from "@/components/tasks/task-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTask() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
          <p className="text-muted-foreground">
            Add a new task to your project
          </p>
        </div>
      </div>

      {/* Task Form */}
      <Suspense fallback={<TaskFormSkeleton />}>
        <TaskForm />
      </Suspense>
    </div>
  )
}

// Loading Skeleton
function TaskFormSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
