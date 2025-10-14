import { Suspense } from "react"
import { CalendarView } from "@/components/calendar/calendar-view"
import { CalendarFilters } from "@/components/calendar/calendar-filters"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"

export default function AdminCalendar() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage tasks in calendar format
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
        <CalendarFilters />
      </Suspense>

      {/* Calendar */}
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarView />
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

function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}