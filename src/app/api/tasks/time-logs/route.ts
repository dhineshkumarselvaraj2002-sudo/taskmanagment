import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { timeLogSchema } from "@/lib/validations/task"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Convert date strings to Date objects
    if (body.startTime) {
      body.startTime = new Date(body.startTime)
    }
    if (body.endTime) {
      body.endTime = new Date(body.endTime)
    }

    const validatedData = timeLogSchema.parse(body)

    // Check if task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: validatedData.taskId },
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      )
    }

    // Check if user has access to this task
    if (session.user.role !== "ADMIN" && task.assignedToId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        duration: validatedData.duration,
        description: validatedData.description,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        taskId: validatedData.taskId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "TIME_LOGGED",
        entityType: "TASK",
        entityId: task.id,
        userId: session.user.id,
        taskId: task.id,
        details: {
          taskName: task.taskName,
          duration: validatedData.duration,
          description: validatedData.description,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: timeLog,
      message: "Time logged successfully",
    })
  } catch (error: any) {
    console.error("Log time error:", error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")
    const userId = searchParams.get("userId")

    let whereClause: any = {}

    if (taskId) {
      // Check if task exists and user has access
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      })

      if (!task) {
        return NextResponse.json(
          { success: false, error: "Task not found" },
          { status: 404 }
        )
      }

      // Check if user has access to this task
      if (session.user.role !== "ADMIN" && task.assignedToId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        )
      }

      whereClause.taskId = taskId
    }

    if (userId) {
      whereClause.userId = userId
    }

    const timeLogs = await prisma.timeLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        task: {
          select: {
            id: true,
            taskName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate total time
    const totalTime = timeLogs.reduce((sum, log) => sum + log.duration, 0)

    return NextResponse.json({
      success: true,
      data: timeLogs,
      totalTime,
    })
  } catch (error: any) {
    console.error("Get time logs error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
