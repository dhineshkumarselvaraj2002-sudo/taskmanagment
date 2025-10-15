import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CalendarEvent } from '@/types'

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

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const assignedTo = searchParams.get('assignedTo')
    const status = searchParams.get('status')?.split(',') || []
    const priority = searchParams.get('priority')?.split(',') || []

    const where: any = {
      ...(start && end && {
        OR: [
          {
            startDate: {
              gte: new Date(start),
              lte: new Date(end)
            }
          },
          {
            endDate: {
              gte: new Date(start),
              lte: new Date(end)
            }
          },
          {
            AND: [
              { startDate: { lte: new Date(start) } },
              { endDate: { gte: new Date(end) } }
            ]
          }
        ]
      }),
      ...(assignedTo && { assignedToId: assignedTo }),
      ...(status.length > 0 && { status: { in: status } }),
      ...(priority.length > 0 && { priority: { in: priority } })
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { startDate: 'asc' }
    })

    const events: CalendarEvent[] = tasks.map(task => ({
      id: task.id,
      title: task.taskName,
      start: task.startDate,
      end: task.endDate,
      resource: {
        task: {
          ...task,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy
        }
      }
    }))

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Get calendar events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}
