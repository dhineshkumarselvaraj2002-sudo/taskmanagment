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

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    // Get current month range if not provided
    const now = new Date()
    const startDate = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = end ? new Date(end) : new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get user's tasks for the calendar
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: currentUser.id,
        startDate: { lte: endDate },
        endDate: { gte: startDate }
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { startDate: 'asc' }
    })

    // Convert tasks to calendar events
    const events = tasks.map(task => ({
      id: task.id,
      title: task.taskName,
      description: task.taskDescription,
      start: new Date(task.startDate),
      end: new Date(task.endDate),
      type: 'task',
      status: task.status,
      priority: task.priority,
      resource: {
        task: {
          id: task.id,
          taskName: task.taskName,
          taskDescription: task.taskDescription,
          status: task.status,
          priority: task.priority,
          startDate: task.startDate,
          endDate: task.endDate,
          createdBy: task.createdBy,
          tags: task.tags,
          checklistItems: task.checklistItems
        }
      }
    }))

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Get user calendar error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}
