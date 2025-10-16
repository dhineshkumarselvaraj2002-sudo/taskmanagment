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

    // Get all tasks
    const tasks = await prisma.task.findMany({
      select: {
        id: true,
        taskName: true,
        assignedToId: true,
        createdById: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        users,
        tasks,
        stats: {
          totalNotifications: notifications.length,
          totalUsers: users.length,
          totalTasks: tasks.length,
          unreadNotifications: notifications.filter(n => n.status === 'UNREAD').length
        }
      }
    })
  } catch (error) {
    console.error('Debug notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    )
  }
}
