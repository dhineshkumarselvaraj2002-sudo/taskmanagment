'use client'

import { useEffect, useState } from 'react'
import { ExtendedUser } from '@/types'
import { format } from 'date-fns'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UserIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import EditUserModal from './EditUserModal'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'

export default function UsersTable() {
  const { toast } = useToast()
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null)
  
  // Filter panel state
  const [showFilters, setShowFilters] = useState(false)
  
  // Temporary filter values
  const [tempSearch, setTempSearch] = useState('')
  const [tempRole, setTempRole] = useState('')
  const [tempDateRange, setTempDateRange] = useState('')
  
  // Debounced search
  const debouncedSearch = useDebounce(search, 2000)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(role && { role }),
        ...(dateRange && { dateRange })
      })
      
      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
        setTotalPages(data.pagination?.totalPages || 1)
        console.log('UsersTable: Fetched users data:', {
          users: data.data?.length,
          totalPages: data.pagination?.totalPages,
          currentPage: page
        })
      } else {
        console.error('UsersTable: API error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, debouncedSearch, role, dateRange])

  // Initialize temp values when filters change
  useEffect(() => {
    setTempRole(role)
    setTempDateRange(dateRange)
  }, [role, dateRange])

  // Filter functions
  const hasTempChanges = () => {
    return tempRole !== role || 
           tempDateRange !== dateRange
  }

  const applyFilters = () => {
    setRole(tempRole)
    setDateRange(tempDateRange)
    setPage(1)
  }

  const resetTempFilters = () => {
    setTempRole(role)
    setTempDateRange(dateRange)
  }

  const clearFilters = () => {
    setSearch('')
    setRole('')
    setDateRange('')
    setTempRole('')
    setTempDateRange('')
    setPage(1)
    // Force a refetch after clearing filters
    setTimeout(() => {
      fetchUsers()
    }, 100)
  }

  const clearTempFilters = () => {
    setTempRole('')
    setTempDateRange('')
    setSearch('')
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (search) count++
    if (role) count++
    if (dateRange) count++
    return count
  }

  const getTempFilterCount = () => {
    let count = 0
    if (search) count++
    if (tempRole) count++
    if (tempDateRange) count++
    return count
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const deletedUser = users.find(user => user.id === userId)
        setUsers(users.filter(user => user.id !== userId))
        
        toast({
          title: "User Deleted Successfully",
          description: `${deletedUser?.name} has been removed from the system.`,
        })
      } else {
        toast({
          title: "Error Deleting User",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast({
        title: "Error Deleting User",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Modern Search and Filters */}
          <div className="mb-6">
            {/* Search Bar and Filter Button in Single Row */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-stone-200 whitespace-nowrap"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Modern Filters Panel */}
            {showFilters && (
              <div className="bg-stone-200 rounded-lg p-3 border border-gray-200">
                <div className="flex gap-2 items-center">
                  {/* Role Filter */}
                  <div className="w-32">
                    <select
                      value={tempRole}
                      onChange={(e) => setTempRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Roles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="USER">User</option>
                    </select>
                  </div>


                  {/* Date Range Filter */}
                  <div className="w-36">
                    <select
                      value={tempDateRange}
                      onChange={(e) => setTempDateRange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  {/* Action Buttons - Only show if any filter option is selected */}
                  {getTempFilterCount() > 0 && (
                    <>
                      <button
                        onClick={applyFilters}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-stone-200 rounded transition-colors duration-200"
                      >
                        Apply
                      </button>
                      <button
                        onClick={clearTempFilters}
                        className="inline-flex items-center px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-stone-200 rounded transition-colors duration-200"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Clear All Button - Show when any filters are active */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-stone-200 rounded transition-colors duration-200"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-stone-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user._count?.assignedTasks || 0} assigned
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((page - 1) * 5) + 1}-{Math.min(page * 5, users.length + ((page - 1) * 5))} of {users.length + ((page - 1) * 5)} users
              {totalPages > 1 && (
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  (Page {page} of {totalPages})
                </span>
              )}
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 mt-1">
                  Debug: totalPages={totalPages}, page={page}, users.length={users.length}
                </div>
              )}
            </div>
            {(totalPages > 1 || users.length === 5) && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-gray-700 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
                  disabled={page === (totalPages || 1)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-gray-700 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => {
            setEditingUser(null)
            fetchUsers()
          }}
        />
      )}
    </>
  )
}
