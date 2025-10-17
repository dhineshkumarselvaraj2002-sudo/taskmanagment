import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const body = await request.json()
    const { tasks, userIds } = body

    if (!tasks || !userIds || !Array.isArray(tasks) || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Validate that all users exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    })

    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: 'One or more users not found' },
        { status: 400 }
      )
    }

    const assignedTasks = []
    const notifications = []

    // Assign 2 tasks to each user
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i]
      const userTasks = tasks.slice(i * 2, (i + 1) * 2) // Get 2 tasks per user

      for (const taskData of userTasks) {
        const task = await prisma.task.create({
          data: {
            taskName: taskData.taskName,
            taskDescription: taskData.taskDescription,
            startDate: new Date(taskData.startDate),
            endDate: new Date(taskData.endDate),
            status: taskData.status || 'TODO',
            priority: taskData.priority || 'MEDIUM',
            category: taskData.category,
            tags: taskData.tags || [],
            estimatedHours: taskData.estimatedHours,
            assignedToId: userId,
            createdById: currentUser.id,
            checklistItems: taskData.checklistItems ? {
              create: taskData.checklistItems.map((item: any, index: number) => ({
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

        assignedTasks.push(task)

        // Create notification for assigned user
        const notification = await prisma.notification.create({
          data: {
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${taskData.taskName}`,
            type: 'TASK_ASSIGNED',
            userId: userId,
            taskId: task.id,
            status: 'UNREAD'
          }
        })

        notifications.push(notification)

        // Send real-time notification to the assigned user
        try {
          const { sendNotificationToUser } = await import('@/app/api/notifications/stream/route')
          await sendNotificationToUser(userId, notification)
        } catch (error) {
          console.error('Failed to send real-time notification:', error)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        assignedTasks, 
        notifications,
        summary: {
          totalTasks: assignedTasks.length,
          totalUsers: userIds.length,
          tasksPerUser: 2
        }
      } 
    })
  } catch (error) {
    console.error('Bulk task assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign tasks' },
      { status: 500 }
    )
  }
}
