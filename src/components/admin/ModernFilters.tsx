'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar, User, Tag, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface ModernFiltersProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: {
    status?: {
      options: FilterOption[]
      value: string
      onChange: (value: string) => void
    }
    priority?: {
      options: FilterOption[]
      value: string
      onChange: (value: string) => void
    }
    user?: {
      options: FilterOption[]
      value: string
      onChange: (value: string) => void
    }
    dateRange?: {
      value: string
      onChange: (value: string) => void
    }
  }
  onClearFilters?: () => void
  onApplyFilters?: () => void
  showSearch?: boolean
  showFilters?: boolean
}

export default function ModernFilters({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = {},
  onClearFilters,
  onApplyFilters,
  showSearch = true,
  showFilters = true
}: ModernFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFilterOptions, setShowFilterOptions] = useState(false)

  const hasActiveFilters = Object.values(filters).some(filter => 
    filter && filter.value && filter.value !== 'all'
  ) || (searchValue && searchValue.length > 0)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-stone-200 focus:bg-white"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      {showFilters && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center space-x-2 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors"
                >
                  <X className="h-3 w-3" />
                  <span>Clear all</span>
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>{isExpanded ? 'Less' : 'More'}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilterOptions && (
            <div className={cn(
              "grid gap-4 transition-all duration-300 overflow-hidden",
              isExpanded ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            )}>
            {/* Status Filter */}
            {filters.status && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={filters.status.value}
                  onChange={(e) => filters.status?.onChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                >
                  {filters.status.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.count && `(${option.count})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority Filter */}
            {filters.priority && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  value={filters.priority.value}
                  onChange={(e) => filters.priority?.onChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                >
                  {filters.priority.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.count && `(${option.count})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Filter */}
            {filters.user && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  User
                </label>
                <select
                  value={filters.user.value}
                  onChange={(e) => filters.user?.onChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                >
                  {filters.user.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.count && `(${option.count})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            {filters.dateRange && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Date Range
                </label>
                <select
                  value={filters.dateRange.value}
                  onChange={(e) => filters.dateRange?.onChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            )}
            </div>
          )}

          {/* Apply Filters Button */}
          {showFilterOptions && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
                </div>
                <div className="flex items-center space-x-2">
                  {onClearFilters && (
                    <button
                      onClick={onClearFilters}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-stone-200 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  {onApplyFilters && (
                    <button
                      onClick={() => {
                        onApplyFilters()
                        setShowFilterOptions(false)
                      }}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Apply Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {searchValue && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchValue}"
                    <button
                      onClick={() => onSearchChange?.('')}
                      className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {Object.entries(filters).map(([key, filter]) => {
                  if (!filter || !filter.value || filter.value === 'all') return null
                  const option = filter.options.find(opt => opt.value === filter.value)
                  return (
                    <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-200 text-gray-800">
                      {key}: {option?.label}
                      <button
                        onClick={() => filter.onChange('all')}
                        className="ml-2 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
