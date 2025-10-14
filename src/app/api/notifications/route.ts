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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const whereClause: any = {
      userId: session.user.id,
    }

    if (status) {
      whereClause.status = status
    }

    if (type) {
      whereClause.type = type
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        include: {
          task: {
            select: {
              id: true,
              taskName: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: whereClause }),
    ])

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get notifications error:", error)
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
    const { title, message, type, userId, taskId } = body

    // Only admin can create notifications for other users
    if (userId && userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: userId || session.user.id,
        taskId,
      },
    })

    return NextResponse.json({
      success: true,
      data: notification,
      message: "Notification created successfully",
    })
  } catch (error: any) {
    console.error("Create notification error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationIds } = body

    if (action === "markAllAsRead") {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          status: "UNREAD",
        },
        data: {
          status: "READ",
        },
      })

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      })
    }

    if (action === "markAsRead" && notificationIds?.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id,
        },
        data: {
          status: "READ",
        },
      })

      return NextResponse.json({
        success: true,
        message: "Notifications marked as read",
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Update notifications error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}