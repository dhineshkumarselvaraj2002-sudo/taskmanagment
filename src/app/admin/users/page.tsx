'use client'

import { useState } from 'react'
import UsersTable from '@/components/admin/UsersTable'
import CreateUserModal from '@/components/admin/CreateUserModal'
import { Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function UsersPage() {
  const { toast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateUserClose = () => {
    setShowCreateModal(false)
  }

  const handleCreateUserSave = () => {
    setShowCreateModal(false)
    
    // Show success toast notification
    toast({
      title: "User Created Successfully",
      description: "New user has been created and added to the system.",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    })
    
    // Reload to show the new user
    window.location.reload()
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        <div className="space-y-6">
          

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="admin-card-title">Users Table</h3>
                  <p className="admin-card-description">
                    View and manage all user accounts in the system
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 admin-button-primary"
                  >
                    Create User
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <UsersTable />
            </div>
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
