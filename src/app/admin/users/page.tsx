import { Suspense } from 'react'
import UsersTable from '@/components/admin/UsersTable'
import CreateUserModal from '@/components/admin/CreateUserModal'
import { SearchParams } from '@/types'

interface UsersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const showCreateModal = params.action === 'create'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="mt-2 text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>
            <CreateUserModal />
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

      {showCreateModal && <CreateUserModal />}
    </div>
  )
}
