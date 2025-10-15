import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskFormData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      where: { id: params.id },
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
      where: { id: params.id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        checklistItems: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Create notifications for significant changes
    if (assignedToId && assignedToId !== currentTask.assignedToId) {
      await prisma.notification.create({
        data: {
          title: 'Task Reassigned',
          message: `Task "${taskName || currentTask.taskName}" has been reassigned to you`,
          type: 'TASK_ASSIGNED',
          userId: assignedToId,
          taskId: task.id
        }
      })

      // Notify previous assignee
      await prisma.notification.create({
        data: {
          title: 'Task Reassigned',
          message: `Task "${taskName || currentTask.taskName}" has been reassigned to another user`,
          type: 'TASK_UPDATED',
          userId: currentTask.assignedToId,
          taskId: task.id
        }
      })
    }

    if (status && status !== currentTask.status) {
      await prisma.notification.create({
        data: {
          title: 'Task Status Updated',
          message: `Task "${taskName || currentTask.taskName}" status changed to ${status}`,
          type: 'STATUS_CHANGED',
          userId: task.assignedToId,
          taskId: task.id
        }
      })
    }

    if (priority && priority !== currentTask.priority) {
      await prisma.notification.create({
        data: {
          title: 'Task Priority Updated',
          message: `Task "${taskName || currentTask.taskName}" priority changed to ${priority}`,
          type: 'PRIORITY_CHANGED',
          userId: task.assignedToId,
          taskId: task.id
        }
      })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { assignedTo: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id }
    })

    // Notify assigned user about task deletion
    await prisma.notification.create({
      data: {
        title: 'Task Deleted',
        message: `Task "${task.taskName}" has been deleted`,
        type: 'TASK_UPDATED',
        userId: task.assignedToId
      }
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
