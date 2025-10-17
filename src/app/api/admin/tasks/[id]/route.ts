import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaskFormData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from cookie (consistent with other admin APIs)
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
    // Get user from cookie (consistent with other admin APIs)
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
      assignedToId,
      checklistItems
    } = body

    // Get current task to track changes
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true }
    })

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Validate assigned user if changing
    if (assignedToId && assignedToId !== currentTask.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId }
      })

      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Assigned user not found' },
          { status: 400 }
        )
      }
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
      ...(estimatedHours !== undefined && { estimatedHours }),
      ...(assignedToId && { assignedToId })
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

    // Create notification for assigned user about task update (only if task has an assigned user)
    if (task.assignedToId) {
      console.log('Creating notification for assigned user:', task.assignedToId)
      const notification = await prisma.notification.create({
        data: {
          title: 'Task Updated',
          message: `The task "${taskName || currentTask.taskName}" has been updated by admin`,
          type: 'TASK_UPDATED',
          userId: task.assignedToId,
          taskId: task.id,
          status: 'UNREAD'
        }
      })
      console.log('Notification created successfully for user:', task.assignedToId)

      // Send real-time notification to the assigned user
      try {
        const { sendNotificationToUser } = await import('@/app/api/notifications/stream/route')
        await sendNotificationToUser(task.assignedToId, notification)
      } catch (error) {
        console.error('Failed to send real-time notification:', error)
      }
    } else {
      console.log('No assigned user found for task, skipping notification creation')
    }

    // If task was reassigned to a different user, notify the new assignee
    if (assignedToId && assignedToId !== currentTask.assignedToId) {
      console.log('Task reassigned, creating notification for new assignee:', assignedToId)
      const reassignmentNotification = await prisma.notification.create({
        data: {
          title: 'Task Assigned to You',
          message: `You have been assigned the task "${taskName || currentTask.taskName}"`,
          type: 'TASK_ASSIGNED',
          userId: assignedToId,
          taskId: task.id,
          status: 'UNREAD'
        }
      })
      console.log('Reassignment notification created successfully for user:', assignedToId)

      // Send real-time notification to the new assignee
      try {
        const { sendNotificationToUser } = await import('@/app/api/notifications/stream/route')
        await sendNotificationToUser(assignedToId, reassignmentNotification)
      } catch (error) {
        console.error('Failed to send real-time notification:', error)
      }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from cookie (consistent with other admin APIs)
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

    const { id } = await params
    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Create notification for assigned user about task deletion (only if task has an assigned user)
    if (task.assignedToId) {
      console.log('Creating deletion notification for assigned user:', task.assignedToId)
      const deletionNotification = await prisma.notification.create({
        data: {
          title: 'Task Deleted',
          message: `The task "${task.taskName}" has been deleted by admin`,
          type: 'TASK_UPDATED',
          userId: task.assignedToId,
          taskId: null, // Task is deleted, so no taskId
          status: 'UNREAD'
        }
      })
      console.log('Deletion notification created successfully for user:', task.assignedToId)

      // Send real-time notification to the assigned user
      try {
        const { sendNotificationToUser } = await import('@/app/api/notifications/stream/route')
        await sendNotificationToUser(task.assignedToId, deletionNotification)
      } catch (error) {
        console.error('Failed to send real-time notification:', error)
      }
    } else {
      console.log('No assigned user found for task, skipping deletion notification')
    }

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
