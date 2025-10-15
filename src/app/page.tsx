import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function HomePage() {
  const session = await auth()

  // If user is authenticated, redirect to appropriate dashboard
  if (session?.user?.id) {
    const userRole = (session.user as any)?.role
    const redirectPath = userRole === "ADMIN" 
      ? "/admin" 
      : "/user/dashboard"
    redirect(redirectPath)
  }

  // If not authenticated, show landing page with sign-in options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Task Management
          </h1>
          <p className="text-gray-600 mb-8">
            Streamline your workflow with our powerful task management system
          </p>
        </div>
        
        <div className="space-y-4">
          <a
            href="/sign-in"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Sign In
          </a>
          
          <a
            href="/sign-up"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Sign Up
          </a>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Demo credentials: admin@test.com / 1234
          </p>
        </div>
      </div>
    </div>
  )
}
