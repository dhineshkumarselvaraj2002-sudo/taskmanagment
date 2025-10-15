"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { ExtendedTask } from "@/types"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

async function fetchTasks() {
  const response = await fetch("/api/tasks")
  if (!response.ok) {
    throw new Error("Failed to fetch tasks")
  }
  const data = await response.json()
  return data.data || []
}

const statusColors = {
  TODO: "#6B7280",
  IN_PROGRESS: "#3B82F6",
  IN_REVIEW: "#F59E0B",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
  BLOCKED: "#8B5CF6",
}

const priorityColors = {
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#F97316",
  CRITICAL: "#EF4444",
}

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<ExtendedTask[]>([])
  const [view, setView] = useState(Views.MONTH)
  const [date, setDate] = useState(new Date())

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    refetchInterval: 30000,
  })

  const events = useMemo(() => {
    if (!tasks) return []

    return tasks.map((task: ExtendedTask) => ({
      id: task.id,
      title: task.taskName,
      start: new Date(task.startDate),
      end: new Date(task.endDate),
      resource: {
        task,
        color: statusColors[task.status as keyof typeof statusColors],
        priorityColor: priorityColors[task.priority as keyof typeof priorityColors],
      },
    }))
  }, [tasks])

  const handleSelectEvent = (event: any) => {
    setSelectedDate(event.start)
    setSelectedTasks([event.resource.task])
  }

  const handleSelectSlot = (slotInfo: any) => {
    const selectedDate = slotInfo.start
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDate)
    dayEnd.setHours(23, 59, 59, 999)

    const tasksForDate = tasks?.filter((task: ExtendedTask) => {
      const taskStart = new Date(task.startDate)
      return taskStart >= dayStart && taskStart <= dayEnd
    }) || []

    setSelectedDate(selectedDate)
    setSelectedTasks(tasksForDate)
  }

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        borderColor: event.resource.color,
        color: "white",
        borderRadius: "4px",
        border: "none",
        fontSize: "12px",
        padding: "2px 4px",
      },
    }
  }

  if (isLoading) {
    return <CalendarSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Failed to load calendar data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="h-[800px] min-h-[800px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%", padding: "20px" }}
              view={view}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              date={date}
              onNavigate={setDate}
              onView={setView}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              popup
              showMultiDayTimes
              step={30}
              timeslots={2}
              components={{
                toolbar: CustomToolbar,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Details Modal */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Tasks for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>
              {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""} scheduled for this date
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks scheduled for this date
              </div>
            ) : (
              selectedTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.taskName}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {task.taskDescription}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignedTo?.image || ""} />
                            <AvatarFallback className="text-xs">
                              {task.assignedTo?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {task.assignedTo?.name || "Unassigned"}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary"
                            style={{ 
                              backgroundColor: statusColors[task.status as keyof typeof statusColors] + "20",
                              color: statusColors[task.status as keyof typeof statusColors]
                            }}
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: priorityColors[task.priority as keyof typeof priorityColors],
                              color: priorityColors[task.priority as keyof typeof priorityColors]
                            }}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Start: {format(new Date(task.startDate), "MMM d, h:mm a")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>End: {format(new Date(task.endDate), "MMM d, h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/tasks/${task.id}`}>
                        View Details
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Custom Toolbar Component
function CustomToolbar({ date, view, onNavigate, onView }: any) {
  const goToBack = () => {
    onNavigate("PREV")
  }

  const goToNext = () => {
    onNavigate("NEXT")
  }

  const goToCurrent = () => {
    onNavigate("TODAY")
  }

  const handleViewChange = (newView: string) => {
    onView(newView)
  }

  return (
    <div className="flex items-center justify-between p-6 border-b bg-gray-50">
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="default" onClick={goToBack} className="px-4 py-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={goToNext} className="px-4 py-2">
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={goToCurrent} className="px-6 py-2">
          Today
        </Button>
      </div>
      
      <div className="flex items-center space-x-3">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(date, "MMMM yyyy")}
        </h2>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant={view === Views.MONTH ? "default" : "outline"}
          size="default"
          onClick={() => handleViewChange(Views.MONTH)}
          className="px-6 py-2"
        >
          Month
        </Button>
        <Button
          variant={view === Views.WEEK ? "default" : "outline"}
          size="default"
          onClick={() => handleViewChange(Views.WEEK)}
          className="px-6 py-2"
        >
          Week
        </Button>
        <Button
          variant={view === Views.DAY ? "default" : "outline"}
          size="default"
          onClick={() => handleViewChange(Views.DAY)}
          className="px-6 py-2"
        >
          Day
        </Button>
      </div>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}