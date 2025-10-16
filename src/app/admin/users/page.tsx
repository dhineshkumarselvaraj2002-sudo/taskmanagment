'use client'

import { Suspense, useState } from 'react'
import UsersTable from '@/components/admin/UsersTable'
import CreateUserModal from '@/components/admin/CreateUserModal'

export default function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateUserClose = () => {
    setShowCreateModal(false)
  }

  const handleCreateUserSave = () => {
    setShowCreateModal(false)
    // Reload to show the new user
    window.location.reload()
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
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

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Users Table</h3>
            <Suspense fallback={
              <div className="flex items-center justify-center h-64 bg-white rounded border">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-600">Loading users...</div>
                </div>
              </div>
            }>
              <UsersTable />
            </Suspense>
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
