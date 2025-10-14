import { ServerExample } from "@/components/server-example"

export default function ServerDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Server Component Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This page demonstrates server-side authentication
          </p>
        </div>
        
        <ServerExample />
      </div>
    </div>
  )
}
