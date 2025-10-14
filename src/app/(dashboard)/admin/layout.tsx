import { Suspense } from "react"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { AdminHeader } from "@/components/dashboard/admin-header"
import { NotificationBell } from "@/components/notifications/notification-bell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
