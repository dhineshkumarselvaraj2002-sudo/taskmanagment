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

    // Get all users with USER role
    const users = await prisma.user.findMany({
      where: { role: 'USER' }
    })

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users found to assign tasks to' },
        { status: 400 }
      )
    }

    // Sample task templates
    const taskTemplates = [
      {
        taskName: 'Website Redesign',
        taskDescription: 'Complete redesign of the company website with modern UI/UX principles',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        category: 'Design',
        tags: ['UI/UX', 'Frontend', 'Design'],
        estimatedHours: 40,
        checklistItems: [
          { title: 'Create wireframes', isCompleted: false },
          { title: 'Design mockups', isCompleted: false },
          { title: 'Get stakeholder approval', isCompleted: false },
          { title: 'Implement design', isCompleted: false }
        ]
      },
      {
        taskName: 'Database Optimization',
        taskDescription: 'Optimize database queries and improve performance',
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        category: 'Backend',
        tags: ['Database', 'Performance', 'Backend'],
        estimatedHours: 24,
        checklistItems: [
          { title: 'Analyze current queries', isCompleted: false },
          { title: 'Identify bottlenecks', isCompleted: false },
          { title: 'Optimize slow queries', isCompleted: false },
          { title: 'Test performance improvements', isCompleted: false }
        ]
      },
      {
        taskName: 'API Documentation',
        taskDescription: 'Create comprehensive API documentation for all endpoints',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        category: 'Documentation',
        tags: ['API', 'Documentation', 'Technical Writing'],
        estimatedHours: 16,
        checklistItems: [
          { title: 'List all API endpoints', isCompleted: false },
          { title: 'Document request/response formats', isCompleted: false },
          { title: 'Add code examples', isCompleted: false },
          { title: 'Review and finalize', isCompleted: false }
        ]
      },
      {
        taskName: 'Security Audit',
        taskDescription: 'Conduct comprehensive security audit of the application',
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        status: 'TODO' as const,
        priority: 'CRITICAL' as const,
        category: 'Security',
        tags: ['Security', 'Audit', 'Compliance'],
        estimatedHours: 60,
        checklistItems: [
          { title: 'Review authentication system', isCompleted: false },
          { title: 'Check for vulnerabilities', isCompleted: false },
          { title: 'Test authorization controls', isCompleted: false },
          { title: 'Generate security report', isCompleted: false }
        ]
      },
      {
        taskName: 'Mobile App Testing',
        taskDescription: 'Test mobile application on various devices and platforms',
        startDate: new Date(),
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        category: 'Testing',
        tags: ['Mobile', 'Testing', 'QA'],
        estimatedHours: 32,
        checklistItems: [
          { title: 'Test on iOS devices', isCompleted: false },
          { title: 'Test on Android devices', isCompleted: false },
          { title: 'Test different screen sizes', isCompleted: false },
          { title: 'Document test results', isCompleted: false }
        ]
      },
      {
        taskName: 'Performance Monitoring',
        taskDescription: 'Set up comprehensive performance monitoring and alerting',
        startDate: new Date(),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        category: 'DevOps',
        tags: ['Monitoring', 'Performance', 'DevOps'],
        estimatedHours: 20,
        checklistItems: [
          { title: 'Set up monitoring tools', isCompleted: false },
          { title: 'Configure alerts', isCompleted: false },
          { title: 'Create dashboards', isCompleted: false },
          { title: 'Test alert system', isCompleted: false }
        ]
      }
    ]

    const assignedTasks = []
    const notifications = []

    // Assign 2 tasks to each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const userTasks = taskTemplates.slice(i * 2, (i + 1) * 2) // Get 2 tasks per user

      for (const taskTemplate of userTasks) {
        const task = await prisma.task.create({
          data: {
            taskName: taskTemplate.taskName,
            taskDescription: taskTemplate.taskDescription,
            startDate: taskTemplate.startDate,
            endDate: taskTemplate.endDate,
            status: taskTemplate.status,
            priority: taskTemplate.priority,
            category: taskTemplate.category,
            tags: taskTemplate.tags,
            estimatedHours: taskTemplate.estimatedHours,
            assignedToId: user.id,
            createdById: currentUser.id,
            checklistItems: {
              create: taskTemplate.checklistItems.map((item, index) => ({
                title: item.title,
                isCompleted: item.isCompleted,
                order: index
              }))
            }
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
            message: `You have been assigned a new task: ${taskTemplate.taskName}`,
            type: 'TASK_ASSIGNED',
            userId: user.id,
            taskId: task.id
          }
        })

        notifications.push(notification)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        assignedTasks, 
        notifications,
        summary: {
          totalTasks: assignedTasks.length,
          totalUsers: users.length,
          tasksPerUser: 2
        }
      } 
    })
  } catch (error) {
    console.error('Seed tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to seed tasks' },
      { status: 500 }
    )
  }
}
