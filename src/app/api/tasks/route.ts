import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { taskSchema, taskFiltersSchema } from "@/lib/validations/task"
import { TaskFilters } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")?.split(",") || []
    const priority = searchParams.get("priority")?.split(",") || []
    const assignedTo = searchParams.get("assignedTo")?.split(",") || []
    const createdBy = searchParams.get("createdBy")?.split(",") || []
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const tags = searchParams.get("tags")?.split(",") || []
    const category = searchParams.get("category")?.split(",") || []

    const filters: any = {}

    // Apply filters
    if (search) {
      filters.OR = [
        { taskName: { contains: search, mode: "insensitive" } },
        { taskDescription: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status.length > 0) {
      filters.status = { in: status }
    }

    if (priority.length > 0) {
      filters.priority = { in: priority }
    }

    if (assignedTo.length > 0) {
      filters.assignedToId = { in: assignedTo }
    }

    if (createdBy.length > 0) {
      filters.createdById = { in: createdBy }
    }

    if (startDate) {
      filters.startDate = { gte: new Date(startDate) }
    }

    if (endDate) {
      filters.endDate = { lte: new Date(endDate) }
    }

    if (tags.length > 0) {
      filters.tags = { hasSome: tags }
    }

    if (category.length > 0) {
      filters.category = { in: category }
    }

    // If user is not admin, only show their assigned tasks
    if (session.user.role !== "ADMIN") {
      filters.assignedToId = session.user.id
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: filters,
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
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          attachments: true,
          timeLogs: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          checklistItems: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where: filters }),
    ])

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get tasks error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
        checklistItems: {
          create: validatedData.checklistItems?.map((item, index) => ({
            title: item.title,
            isCompleted: item.isCompleted,
            order: index,
          })) || [],
        },
      },
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
        checklistItems: true,
      },
    })

    // Create notification for assigned user
    if (task.assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: "New Task Assigned",
          message: `You have been assigned a new task: ${task.taskName}`,
          type: "TASK_ASSIGNED",
          userId: task.assignedToId,
          taskId: task.id,
        },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "TASK_CREATED",
        entityType: "TASK",
        entityId: task.id,
        userId: session.user.id,
        taskId: task.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: task,
      message: "Task created successfully",
    })
  } catch (error: any) {
    console.error("Create task error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}