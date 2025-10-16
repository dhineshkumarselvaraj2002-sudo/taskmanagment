import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message, title } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        title: title || 'Test Notification',
        message: message || 'This is a test notification to verify the system is working',
        type: 'TASK_ASSIGNED',
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      data: notification,
      message: `Test notification created for user: ${user.name} (${user.email})`
    })
  } catch (error) {
    console.error('Create test notification error:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    )
  }
}
