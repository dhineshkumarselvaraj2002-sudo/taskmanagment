import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get user from cookie (we'll set this in the API routes)
  const userCookie = request.cookies.get('user')?.value
  let user = null
  
  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch (error) {
      console.error('Error parsing user cookie:', error)
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
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

  // If user is not authenticated, redirect to sign-in
  if (!user?.id) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Admin-only routes
  const adminRoutes = [
    "/admin",
    "/api/admin",
  ]

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's an admin route and user is not admin, redirect to user dashboard
  if (isAdminRoute && user?.role !== "ADMIN") {
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
  if (isUserRoute && user?.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // If user is authenticated and on root, redirect to appropriate dashboard
  if (pathname === "/") {
    const redirectUrl = user?.role === "ADMIN" 
      ? "/admin" 
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
