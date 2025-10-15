import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let whereClause: any = {}

    // If user is not admin, only show their tasks
    if (session.user.role !== "ADMIN") {
      whereClause.assignedToId = session.user.id
    } else if (userId) {
      whereClause.assignedToId = userId
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Get task statistics
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      recentTasks,
      taskCompletionRate,
      averageCompletionTime,
    ] = await Promise.all([
      // Total tasks
      prisma.task.count({ where: whereClause }),

      // Completed tasks
      prisma.task.count({
        where: { ...whereClause, status: "COMPLETED" },
      }),

      // In progress tasks
      prisma.task.count({
        where: { ...whereClause, status: "IN_PROGRESS" },
      }),

      // Pending tasks
      prisma.task.count({
        where: { ...whereClause, status: "TODO" },
      }),

      // Overdue tasks
      prisma.task.count({
        where: {
          ...whereClause,
          endDate: { lt: new Date() },
          status: { not: "COMPLETED" },
        },
      }),

      // Tasks by priority
      prisma.task.groupBy({
        by: ["priority"],
        where: whereClause,
        _count: { priority: true },
      }),

      // Tasks by status
      prisma.task.groupBy({
        by: ["status"],
        where: whereClause,
        _count: { status: true },
      }),

      // Recent tasks
      prisma.task.findMany({
        where: whereClause,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Task completion rate
      prisma.task.aggregate({
        where: whereClause,
        _avg: {
          // This would need a completion rate field in the schema
        },
      }),

      // Average completion time
      prisma.task.findMany({
        where: {
          ...whereClause,
          status: "COMPLETED",
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Calculate average completion time
    const completedTasksWithTime = await prisma.task.findMany({
      where: {
        ...whereClause,
        status: "COMPLETED",
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    })

    const averageCompletionTimeInDays = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => {
          const completionTime = task.updatedAt.getTime() - task.createdAt.getTime()
          return sum + (completionTime / (1000 * 60 * 60 * 24)) // Convert to days
        }, 0) / completedTasksWithTime.length
      : 0

    // Get user performance metrics
    const userPerformance = await prisma.task.groupBy({
      by: ["assignedToId"],
      where: whereClause,
      _count: { id: true },
      _avg: {
        // This would need additional fields in the schema
      },
    })

    // Get tasks created this month
    const currentMonth = new Date()
    currentMonth.setDate(1)
    const tasksThisMonth = await prisma.task.count({
      where: {
        ...whereClause,
        createdAt: { gte: currentMonth },
      },
    })

    // Get tasks completed this month
    const completedThisMonth = await prisma.task.count({
      where: {
        ...whereClause,
        status: "COMPLETED",
        updatedAt: { gte: currentMonth },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          overdueTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          averageCompletionTimeInDays: Math.round(averageCompletionTimeInDays * 100) / 100,
        },
        distribution: {
          byPriority: tasksByPriority.map(item => ({
            priority: item.priority,
            count: item._count.priority,
          })),
          byStatus: tasksByStatus.map(item => ({
            status: item.status,
            count: item._count.status,
          })),
        },
        monthly: {
          tasksCreated: tasksThisMonth,
          tasksCompleted: completedThisMonth,
        },
        recentTasks,
        userPerformance: userPerformance.map(item => ({
          userId: item.assignedToId,
          taskCount: item._count.id,
        })),
      },
    })
  } catch (error: any) {
    console.error("Get task analytics error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
