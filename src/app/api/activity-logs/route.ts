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
    const userId = searchParams.get("userId")
    const action = searchParams.get("action")
    const entityType = searchParams.get("entityType")

    const whereClause: any = {}

    // If userId is provided, filter by user
    if (userId) {
      whereClause.userId = userId
    } else if (session.user.role !== "ADMIN") {
      // Non-admin users can only see their own activity
      whereClause.userId = session.user.id
    }

    if (action) {
      whereClause.action = action
    }

    if (entityType) {
      whereClause.entityType = entityType
    }

    const [activityLogs, total] = await Promise.all([
      prisma.activityLog.findMany({
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
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where: whereClause }),
    ])

    return NextResponse.json({
      success: true,
      data: activityLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get activity logs error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
