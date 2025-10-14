import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/api/auth",
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If user is not authenticated, redirect to signin
  if (!session?.user?.id) {
    const signInUrl = new URL("/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Admin-only routes
  const adminRoutes = [
    "/admin",
    "/api/users",
    "/api/dashboard/stats",
  ]

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's an admin route and user is not admin, redirect to user dashboard
  if (isAdminRoute && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url))
  }

  // User-only routes (non-admin)
  const userRoutes = [
    "/user",
  ]

  const isUserRoute = userRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a user route and user is admin, redirect to admin dashboard
  if (isUserRoute && session.user.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  // If user is authenticated and on root, redirect to appropriate dashboard
  if (pathname === "/") {
    const redirectUrl = session.user.role === "ADMIN" 
      ? "/admin/dashboard" 
      : "/user/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
