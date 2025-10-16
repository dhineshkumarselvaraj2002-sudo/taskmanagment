'use client'

import { useState } from 'react'
import UsersTable from '@/components/admin/UsersTable'
import CreateUserModal from '@/components/admin/CreateUserModal'
import ModernFilters from '@/components/admin/ModernFilters'

export default function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'USER', label: 'User' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ]

  const handleCreateUserClose = () => {
    setShowCreateModal(false)
  }

  const handleCreateUserSave = () => {
    setShowCreateModal(false)
    // Reload to show the new user
    window.location.reload()
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setRoleFilter('all')
    setStatusFilter('all')
    setDateRangeFilter('all')
  }

  const handleApplyFilters = () => {
    // Here you would typically trigger a data fetch with the current filter values
    console.log('Applying filters:', {
      search: searchValue,
      role: roleFilter,
      status: statusFilter,
      dateRange: dateRangeFilter
    })
    // You can add your data fetching logic here
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="mt-2 text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>
            <div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create User
              </button>
            </div>
          </div>

          {/* Modern Filters */}
          {/* <ModernFilters
            searchPlaceholder="Search users by name, email, or role..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filters={{
              status: {
                options: statusOptions,
                value: statusFilter,
                onChange: setStatusFilter
              },
              user: {
                options: roleOptions,
                value: roleFilter,
                onChange: setRoleFilter
              },
              dateRange: {
                value: dateRangeFilter,
                onChange: setDateRangeFilter
              }
            }}
            onClearFilters={handleClearFilters}
            onApplyFilters={handleApplyFilters}
          /> */}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Users Table</h3>
            <UsersTable />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal 
          onClose={handleCreateUserClose}
          onSave={handleCreateUserSave}
        />
      )}
    </div>
  )
}
