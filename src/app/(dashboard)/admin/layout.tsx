import { Suspense } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-6 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  )
}
