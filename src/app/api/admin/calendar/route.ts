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
        endDate: {
          gte: new Date(start),
          lte: new Date(end)
        }
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
      orderBy: { endDate: 'asc' }
    })

    // Group tasks by deadline date
    const deadlineMap = new Map<string, any[]>()
    
    tasks.forEach(task => {
      const taskDate = new Date(task.endDate)
      const year = taskDate.getFullYear()
      const month = String(taskDate.getMonth() + 1).padStart(2, '0')
      const day = String(taskDate.getDate()).padStart(2, '0')
      const deadlineDate = `${year}-${month}-${day}` // YYYY-MM-DD format
      
      if (!deadlineMap.has(deadlineDate)) {
        deadlineMap.set(deadlineDate, [])
      }
      
      deadlineMap.get(deadlineDate)!.push({
        id: task.id,
        taskName: task.taskName,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        assignedTo: task.assignedTo,
        endDate: task.endDate
      })
    })

    // Convert map to array of date objects
    const deadlineData = Array.from(deadlineMap.entries()).map(([date, tasks]) => ({
      date,
      tasks
    }))

    console.log('Tasks found:', tasks.length)
    console.log('Deadline data:', deadlineData)

    return NextResponse.json({ success: true, data: deadlineData })
  } catch (error) {
    console.error('Get calendar deadlines error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar deadlines' },
      { status: 500 }
    )
  }
}
