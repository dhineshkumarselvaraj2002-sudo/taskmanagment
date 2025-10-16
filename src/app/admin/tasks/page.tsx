import { Suspense } from 'react'
import TasksTable from '@/components/admin/TasksTable'
import CreateTaskModalWrapper from '@/components/admin/CreateTaskModalWrapper'
import { SearchParams } from '@/types'

interface TasksPageProps {
  searchParams: Promise<SearchParams>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams
  const showCreateModal = params.action === 'create'

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="mt-1 text-gray-600">Manage and assign tasks to users</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64 bg-white rounded border">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-600">Loading tasks...</div>
                </div>
              </div>
            }>
              <TasksTable />
            </Suspense>
          </div>
        </div>
      </div>

      {showCreateModal && <CreateTaskModalWrapper />}
    </div>
  )
}
