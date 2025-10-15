import { Suspense } from 'react'
import NotificationsTable from '@/components/admin/NotificationsTable'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage system notifications and alerts
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded-lg" />}>
        <NotificationsTable />
      </Suspense>
    </div>
  )
}
