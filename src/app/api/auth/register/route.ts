import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signUpApiSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = signUpApiSchema.parse(body)

    console.log(body);
    console.log(validatedData);
    
    
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Determine role based on email
    const role = validatedData.email === "dineshnayak50478@gmail.com" ? "ADMIN" : "USER"

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: role,
        isActive: true,
        emailNotifications: true,
      }
    })

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user

    // Create response with user data
    const response = NextResponse.json(
      { 
        message: "User created successfully",
        user: userWithoutPassword
      },
      { status: 201 }
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
    console.error("Registration error:", error)
    
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