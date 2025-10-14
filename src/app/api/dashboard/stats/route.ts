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
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const whereClause: any = {}

    // If userId is provided, filter by user
    if (userId) {
      whereClause.assignedToId = userId
    }

    // If date range is provided, filter by date
    if (dateFrom && dateTo) {
      whereClause.startDate = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      }
    }

    // If user is not admin, only show their tasks
    if (session.user.role !== "ADMIN" && !userId) {
      whereClause.assignedToId = session.user.id
    }

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalUsers,
      tasksByStatus,
      tasksByPriority,
      recentTasks,
      upcomingDeadlines,
      userPerformance,
    ] = await Promise.all([
      // Total tasks
      prisma.task.count({ where: whereClause }),
      
      // Completed tasks
      prisma.task.count({
        where: { ...whereClause, status: "COMPLETED" },
      }),
      
      // Pending tasks (not completed or cancelled)
      prisma.task.count({
        where: {
          ...whereClause,
          status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"] },
        },
      }),
      
      // Overdue tasks
      prisma.task.count({
        where: {
          ...whereClause,
          endDate: { lt: new Date() },
          status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"] },
        },
      }),
      
      // Total users (only for admin)
      session.user.role === "ADMIN" 
        ? prisma.user.count({ where: { isActive: true } })
        : 0,
      
      // Tasks by status
      prisma.task.groupBy({
        by: ["status"],
        where: whereClause,
        _count: { status: true },
      }),
      
      // Tasks by priority
      prisma.task.groupBy({
        by: ["priority"],
        where: whereClause,
        _count: { priority: true },
      }),
      
      // Recent tasks
      prisma.task.findMany({
        where: whereClause,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      
      // Upcoming deadlines (next 7 days)
      prisma.task.findMany({
        where: {
          ...whereClause,
          endDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"] },
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { endDate: "asc" },
        take: 10,
      }),
      
      // User performance (only for admin)
      session.user.role === "ADMIN"
        ? prisma.user.findMany({
            select: {
              id: true,
              name: true,
              image: true,
              _count: {
                select: {
                  assignedTasks: {
                    where: { status: "COMPLETED" },
                  },
                },
              },
            },
            orderBy: {
              assignedTasks: {
                _count: "desc",
              },
            },
            take: 5,
          })
        : [],
    ])

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalUsers,
      completionRate: Math.round(completionRate * 100) / 100,
      tasksByStatus: tasksByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      tasksByPriority: tasksByPriority.map((item) => ({
        priority: item.priority,
        count: item._count.priority,
      })),
      recentTasks,
      upcomingDeadlines,
      userPerformance,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}