import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaskFormData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true,
        timeLogs: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        checklistItems: {
          orderBy: { order: 'asc' }
        },
        activityLogs: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user is assigned to this task
    if (task.assignedToId !== currentUser.id) {
      return NextResponse.json({ 
        error: 'You can only view tasks assigned to you'
      }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body: Partial<TaskFormData> = await request.json()
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
      checklistItems
    } = body

    // Get current task to check permissions
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true }
    })

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user is assigned to this task
    if (currentTask.assignedToId !== currentUser.id) {
      return NextResponse.json({ 
        error: 'You can only update tasks assigned to you'
      }, { status: 403 })
    }

    const updateData: any = {
      ...(taskName && { taskName }),
      ...(taskDescription && { taskDescription }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category !== undefined && { category }),
      ...(tags && { tags }),
      ...(estimatedHours !== undefined && { estimatedHours })
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        checklistItems: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Create notification for the admin who assigned the task
    if (currentTask.createdById !== currentUser.id) {
      console.log('User updated task, creating notification for admin:', currentTask.createdById)
      const notification = await prisma.notification.create({
        data: {
          title: 'Task Updated',
          message: `The task "${taskName || currentTask.taskName}" has been updated by ${currentUser.name}`,
          type: 'TASK_UPDATED',
          userId: currentTask.createdById,
          taskId: task.id,
          status: 'UNREAD'
        }
      })
      console.log('Notification created successfully for admin:', currentTask.createdById)

      // Send real-time notification to the admin
      try {
        const { sendNotificationToUser } = await import('@/app/api/notifications/stream/route')
        await sendNotificationToUser(currentTask.createdById, notification)
      } catch (error) {
        console.error('Failed to send real-time notification:', error)
      }
    } else {
      console.log('User updated their own task, no notification needed')
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}
