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
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')?.split(',') || []
    const priority = searchParams.get('priority')?.split(',') || []
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where: any = {
      assignedToId: currentUser.id,
      ...(search && {
        OR: [
          { taskName: { contains: search, mode: 'insensitive' as const } },
          { taskDescription: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(status.length > 0 && { status: { in: status } }),
      ...(priority.length > 0 && { priority: { in: priority } })
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          checklistItems: true,
          _count: {
            select: {
              comments: true,
              attachments: true,
              timeLogs: true
            }
          }
        }
      }),
      prisma.task.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get user tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      taskName,
      taskDescription,
      startDate,
      endDate,
      priority,
      category,
      estimatedHours,
      checklistItems
    } = body

    // Validate required fields
    if (!taskName || !taskDescription || !endDate) {
      return NextResponse.json(
        { error: 'Task name, description, and end date are required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        taskName,
        taskDescription,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'TODO',
        priority: priority || 'MEDIUM',
        category,
        estimatedHours,
        assignedToId: currentUser.id, // User creates task for themselves
        createdById: currentUser.id,
        checklistItems: checklistItems && checklistItems.length > 0 ? {
          create: checklistItems.map((item: any, index: number) => ({
            title: item.title,
            isCompleted: item.isCompleted || false,
            order: index
          }))
        } : undefined
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        checklistItems: true
      }
    })

    // Create notification for the user (self-assigned task)
    const notification = await prisma.notification.create({
      data: {
        title: 'Task Created',
        message: `You have created a new task: ${taskName}`,
        type: 'TASK_ASSIGNED',
        userId: currentUser.id,
        taskId: task.id,
        status: 'UNREAD'
      }
    })

    // Send real-time notification to the user
    try {
      const { sendNotificationToUser } = await import('@/app/api/notifications/stream/route')
      await sendNotificationToUser(currentUser.id, notification)
    } catch (error) {
      console.error('Failed to send real-time notification:', error)
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Create user task error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}