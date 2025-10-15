import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signInSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = signInSchema.parse(body)

    console.log("body: ",body);
    console.log(validatedData);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: "Account is deactivated. Please contact support." },
        { status: 401 }
      )
    }

    // Check if user has a password (for manual sign-in)
    if (!user.password) {
      return NextResponse.json(
        { message: "Please use Google sign-in for this account" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user

    // Create response with user data
    const response = NextResponse.json(
      { 
        message: "Sign-in successful",
        user: userWithoutPassword
      },
      { status: 200 }
    )

    // Set user cookie for session management
    response.cookies.set('user', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error: any) {
    console.error("Sign-in error:", error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
