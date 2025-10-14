import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { taskUpdateSchema } from "@/lib/validations/task"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
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
          orderBy: { createdAt: "desc" },
        },
        checklistItems: {
          orderBy: { order: "asc" },
        },
        activityLogs: {
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
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has access to this task
    if (session.user.role !== "ADMIN" && task.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error: any) {
    console.error("Get task error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = taskUpdateSchema.parse(body)

    // Check if task exists and user has access
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role !== "ADMIN" && existingTask.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: validatedData,
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
        checklistItems: {
          orderBy: { order: "asc" },
        },
      },
    })

    // Create notifications for status/priority changes
    if (validatedData.status && validatedData.status !== existingTask.status) {
      await prisma.notification.create({
        data: {
          title: "Task Status Updated",
          message: `Task "${task.taskName}" status changed to ${validatedData.status}`,
          type: "STATUS_CHANGED",
          userId: task.assignedToId,
          taskId: task.id,
        },
      })
    }

    if (validatedData.priority && validatedData.priority !== existingTask.priority) {
      await prisma.notification.create({
        data: {
          title: "Task Priority Updated",
          message: `Task "${task.taskName}" priority changed to ${validatedData.priority}`,
          type: "PRIORITY_CHANGED",
          userId: task.assignedToId,
          taskId: task.id,
        },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "TASK_UPDATED",
        entityType: "TASK",
        entityId: task.id,
        userId: session.user.id,
        taskId: task.id,
        changes: validatedData,
      },
    })

    return NextResponse.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    })
  } catch (error: any) {
    console.error("Update task error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Only admin or task creator can delete
    if (session.user.role !== "ADMIN" && existingTask.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "TASK_DELETED",
        entityType: "TASK",
        entityId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete task error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}