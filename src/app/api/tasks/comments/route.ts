import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { commentSchema } from "@/lib/validations/task"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = commentSchema.parse(body)

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

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
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

    // Create notification for task assignee (if different from commenter)
    if (task.assignedToId && task.assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: "New Comment on Task",
          message: `${session.user.name} commented on task: ${task.taskName}`,
          type: "COMMENT_ADDED",
          userId: task.assignedToId,
          taskId: task.id,
        },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "COMMENT_ADDED",
        entityType: "TASK",
        entityId: task.id,
        userId: session.user.id,
        taskId: task.id,
        details: {
          taskName: task.taskName,
          commentLength: validatedData.content.length,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: comment,
      message: "Comment added successfully",
    })
  } catch (error: any) {
    console.error("Add comment error:", error)
    
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

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "Task ID is required" },
        { status: 400 }
      )
    }

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

    const comments = await prisma.comment.findMany({
      where: { taskId },
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: comments,
    })
  } catch (error: any) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
