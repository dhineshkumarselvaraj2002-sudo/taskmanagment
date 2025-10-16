import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        task: { 
          select: { 
            id: true, 
            taskName: true, 
            status: true, 
            priority: true,
            endDate: true
          } 
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        users,
        totalNotifications: notifications.length,
        totalUsers: users.length
      }
    })
  } catch (error) {
    console.error('Test notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test data' },
      { status: 500 }
    )
  }
}
