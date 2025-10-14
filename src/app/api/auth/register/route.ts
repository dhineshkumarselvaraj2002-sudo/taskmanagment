import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/users"
import { signUpSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signUpSchema.parse(body)

    const user = await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role,
    })

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailNotifications: user.emailNotifications,
        createdAt: user.createdAt,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}