import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user dashboard statistics
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks
    ] = await Promise.all([
      prisma.task.count({ where: { assignedToId: currentUser.id } }),
      prisma.task.count({ 
        where: { 
          assignedToId: currentUser.id,
          status: 'COMPLETED' 
        } 
      }),
      prisma.task.count({ 
        where: { 
          assignedToId: currentUser.id,
          status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] } 
        } 
      }),
      prisma.task.count({ 
        where: { 
          assignedToId: currentUser.id,
          endDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      })
    ])

    const stats = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('User dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
