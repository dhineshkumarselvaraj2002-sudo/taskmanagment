import { Suspense } from "react"
import { UserSidebar } from "@/components/dashboard/user-sidebar"
import { UserHeader } from "@/components/dashboard/user-header"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <UserSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <UserHeader />
        
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
