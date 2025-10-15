import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const assignTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  assignedToId: z.string().min(1, "Assigned user ID is required"),
  reason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = assignTaskSchema.parse(body)

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: validatedData.taskId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      )
    }

    // Check permissions - only admin or task creator can reassign
    if (session.user.role !== "ADMIN" && task.createdById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    // Check if assigned user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: validatedData.assignedToId }
    })

    if (!assignedUser) {
      return NextResponse.json(
        { success: false, error: "Assigned user not found" },
        { status: 400 }
      )
    }

    // Update task assignment
    const updatedTask = await prisma.task.update({
      where: { id: validatedData.taskId },
      data: {
        assignedToId: validatedData.assignedToId,
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
      },
    })

    // Create notification for new assignee
    if (validatedData.assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: "Task Assigned to You",
          message: `You have been assigned the task: ${task.taskName}`,
          type: "TASK_ASSIGNED",
          userId: validatedData.assignedToId,
          taskId: task.id,
        },
      })
    }

    // Create notification for previous assignee if different
    if (task.assignedToId && task.assignedToId !== validatedData.assignedToId) {
      await prisma.notification.create({
        data: {
          title: "Task Reassigned",
          message: `Task "${task.taskName}" has been reassigned to ${assignedUser.name}`,
          type: "TASK_REASSIGNED",
          userId: task.assignedToId,
          taskId: task.id,
        },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "TASK_REASSIGNED",
        entityType: "TASK",
        entityId: task.id,
        userId: session.user.id,
        taskId: task.id,
        details: {
          taskName: task.taskName,
          previousAssignee: task.assignedTo?.name,
          newAssignee: assignedUser.name,
          reason: validatedData.reason,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: "Task assigned successfully",
    })
  } catch (error: any) {
    console.error("Assign task error:", error)
    
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
