import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DashboardStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie (custom auth)
    const userCookie = request.cookies.get('user')?.value
    let currentUser = null
    
    if (userCookie) {
      try {
        currentUser = JSON.parse(userCookie)
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get dashboard statistics
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalUsers,
      recentTasks,
      upcomingDeadlines
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] } } }),
      prisma.task.count({ 
        where: { 
          endDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      prisma.user.count(),
      prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.task.findMany({
        where: {
          endDate: { 
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          },
          status: { not: 'COMPLETED' }
        },
        take: 5,
        orderBy: { endDate: 'asc' },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } }
        }
      })
    ])

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const stats: DashboardStats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalUsers,
      completionRate: Math.round(completionRate * 100) / 100,
      recentTasks,
      upcomingDeadlines
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
