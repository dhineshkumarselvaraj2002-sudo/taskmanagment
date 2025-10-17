import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from cookie (consistent with other user APIs)
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

    const { id: taskId } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the current task
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
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

    // Update the task status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: 'STATUS_CHANGED',
        entityType: 'TASK',
        entityId: taskId,
        changes: {
          status: {
            from: currentTask.status,
            to: status
          }
        },
        userId: currentUser.id,
        taskId: taskId
      }
    })

    // Only notify the admin who originally created/assigned the task
    if (currentTask.createdById !== currentUser.id) {
      console.log('User changed task status, creating notification for admin:', currentTask.createdById)
      const notification = await prisma.notification.create({
        data: {
          title: 'Task Status Updated',
          message: `Task "${currentTask.taskName}" status changed from ${currentTask.status} to ${status} by ${currentUser.name}`,
          type: 'STATUS_CHANGED',
          userId: currentTask.createdById,
          taskId: taskId,
          status: 'UNREAD'
        }
      })
      console.log('Status change notification created successfully for admin:', currentTask.createdById)

      // Send real-time notification to the admin
      try {
        const { sendNotificationToUser } = await import('@/app/api/notifications/stream/route')
        await sendNotificationToUser(currentTask.createdById, notification)
      } catch (error) {
        console.error('Failed to send real-time notification:', error)
      }
    } else {
      console.log('User changed status of their own task, no notification needed')
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Task status updated successfully'
    })

  } catch (error) {
    console.error('Update task status error:', error)
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    )
  }
}
