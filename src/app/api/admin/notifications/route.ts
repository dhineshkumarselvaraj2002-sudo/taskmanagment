import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')?.split(',') || []
    const type = searchParams.get('type')?.split(',') || []
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    const where: any = {
      ...(status.length > 0 && { status: { in: status } }),
      ...(type.length > 0 && { type: { in: type } }),
      ...(userId && { userId })
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: { 
            select: { 
              id: true, 
              taskName: true, 
              status: true, 
              priority: true 
            } 
          }
        }
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, userId, taskId } = body

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
        taskId
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { 
          select: { 
            id: true, 
            taskName: true, 
            status: true, 
            priority: true 
          } 
        }
      }
    })

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
