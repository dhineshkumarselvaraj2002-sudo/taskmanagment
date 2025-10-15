import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Sign-out successful" },
      { status: 200 }
    )

    // Clear user cookie
    response.cookies.set('user', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })

    return response
  } catch (error) {
    console.error("Sign-out error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
