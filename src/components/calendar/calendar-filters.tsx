"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Filter, X } from "lucide-react"

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "BLOCKED", label: "Blocked" },
]

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
]

export function CalendarFilters() {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedPriority, setSelectedPriority] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()

  const handleStatusChange = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  const clearFilters = () => {
    setSelectedStatus([])
    setSelectedPriority([])
    setSelectedUser("")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasActiveFilters = selectedStatus.length > 0 || selectedPriority.length > 0 || selectedUser || dateFrom || dateTo

  return (
    <div className="bg-white rounded-lg border shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Filter className="h-6 w-6 text-gray-600" />
          <span className="font-semibold text-xl text-gray-900">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="default" onClick={clearFilters} className="px-4 py-2">
            <X className="h-5 w-5 mr-2" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Status Filter */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900">Status</label>
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedStatus.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedStatus.map((status) => (
                <Badge key={status} variant="secondary" className="text-sm px-3 py-1">
                  {statusOptions.find(s => s.value === status)?.label}
                  <button
                    onClick={() => handleStatusChange(status)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900">Priority</label>
          <Select onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPriority.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedPriority.map((priority) => (
                <Badge key={priority} variant="secondary" className="text-sm px-3 py-1">
                  {priorityOptions.find(p => p.value === priority)?.label}
                  <button
                    onClick={() => handlePriorityChange(priority)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* User Filter */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900">Assigned To</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All users</SelectItem>
              <SelectItem value="user1">John Doe</SelectItem>
              <SelectItem value="user2">Jane Smith</SelectItem>
              <SelectItem value="user3">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900">From Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                <CalendarIcon className="mr-3 h-5 w-5" />
                {dateFrom ? format(dateFrom, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900">To Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                <CalendarIcon className="mr-3 h-5 w-5" />
                {dateTo ? format(dateTo, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-700 font-medium">
              {selectedStatus.length + selectedPriority.length + (selectedUser ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)} filter{selectedStatus.length + selectedPriority.length + (selectedUser ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) !== 1 ? "s" : ""} applied
            </span>
            <Button variant="outline" size="default" onClick={clearFilters} className="px-6 py-2">
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
