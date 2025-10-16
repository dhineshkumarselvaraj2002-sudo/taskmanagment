import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaskFormData, TaskFilters } from '@/types'

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')?.split(',') || []
    const priority = searchParams.get('priority')?.split(',') || []
    const assignedTo = searchParams.get('assignedTo')?.split(',') || []
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {
      ...(search && {
        OR: [
          { taskName: { contains: search, mode: 'insensitive' as const } },
          { taskDescription: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(status.length > 0 && { status: { in: status } }),
      ...(priority.length > 0 && { priority: { in: priority } }),
      ...(assignedTo.length > 0 && { assignedToId: { in: assignedTo } }),
      ...(startDate && { startDate: { gte: new Date(startDate) } }),
      ...(endDate && { endDate: { lte: new Date(endDate) } })
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          taskName: true,
          taskDescription: true,
          startDate: true,
          endDate: true,
          status: true,
          priority: true,
          category: true,
          tags: true,
          estimatedHours: true,
          actualHours: true,
          progress: true,
          isRecurring: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } }
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
    console.error('Get tasks error:', error)
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
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: TaskFormData = await request.json()
    const {
      taskName,
      taskDescription,
      startDate,
      endDate,
      status,
      priority,
      category,
      tags,
      estimatedHours,
      assignedToId,
      checklistItems
    } = body

    // Validate assigned user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId }
    })

    if (!assignedUser) {
      return NextResponse.json(
        { error: 'Assigned user not found' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        taskName,
        taskDescription,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        priority,
        category,
        tags: tags || [],
        estimatedHours,
        assignedToId,
        createdById: currentUser.id,
        checklistItems: checklistItems ? {
          create: checklistItems.map((item, index) => ({
            title: item.title,
            isCompleted: item.isCompleted,
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

    // Create notification for assigned user
    console.log('Creating notification for user:', assignedToId, 'task:', task.id)
    const notification = await prisma.notification.create({
      data: {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${taskName}`,
        type: 'TASK_ASSIGNED',
        userId: assignedToId,
        taskId: task.id
      }
    })
    console.log('Notification created:', notification)

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
