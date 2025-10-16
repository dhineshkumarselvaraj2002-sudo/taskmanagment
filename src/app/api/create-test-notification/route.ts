import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        title: 'Test Notification',
        message: message || 'This is a test notification to verify the system is working',
        type: 'TASK_ASSIGNED',
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Create test notification error:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    )
  }
}
