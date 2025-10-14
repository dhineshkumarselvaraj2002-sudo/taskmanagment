"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  User,
  Tag,
  Clock
} from "lucide-react"

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

const userOptions = [
  { value: "user1", label: "John Doe" },
  { value: "user2", label: "Jane Smith" },
  { value: "user3", label: "Mike Johnson" },
  { value: "user4", label: "Sarah Wilson" },
]

const categoryOptions = [
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
]

export function TaskFilters() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedPriority, setSelectedPriority] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [showAdvanced, setShowAdvanced] = useState(false)

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
    setSearchQuery("")
    setSelectedStatus([])
    setSelectedPriority([])
    setSelectedUser("")
    setSelectedCategory("")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasActiveFilters = searchQuery || selectedStatus.length > 0 || selectedPriority.length > 0 || selectedUser || selectedCategory || dateFrom || dateTo

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide" : "Show"} Advanced
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger>
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
            <div className="flex flex-wrap gap-1">
              {selectedStatus.map((status) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {statusOptions.find(s => s.value === status)?.label}
                  <button
                    onClick={() => handleStatusChange(status)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select onValueChange={handlePriorityChange}>
            <SelectTrigger>
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
            <div className="flex flex-wrap gap-1">
              {selectedPriority.map((priority) => (
                <Badge key={priority} variant="secondary" className="text-xs">
                  {priorityOptions.find(p => p.value === priority)?.label}
                  <button
                    onClick={() => handlePriorityChange(priority)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* User Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Assigned To</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All users</SelectItem>
              {userOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pt-4 border-t">
          {/* Date From */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
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

          {/* Quick Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus(["TODO"])
                  setSelectedPriority(["HIGH", "CRITICAL"])
                }}
              >
                <Clock className="h-3 w-3 mr-1" />
                Urgent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus(["COMPLETED"])
                }}
              >
                Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus(["IN_PROGRESS"])
                }}
              >
                In Progress
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedStatus.length + selectedPriority.length + (selectedUser ? 1 : 0) + (selectedCategory ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (searchQuery ? 1 : 0)} filter{selectedStatus.length + selectedPriority.length + (selectedUser ? 1 : 0) + (selectedCategory ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (searchQuery ? 1 : 0) !== 1 ? "s" : ""} applied
            </span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
