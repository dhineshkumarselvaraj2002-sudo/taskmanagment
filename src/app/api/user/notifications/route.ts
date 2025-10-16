import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie (custom auth)
    const userCookie = request.cookies.get('user')?.value
    let currentUser = null
    
    console.log('User notifications API - userCookie:', userCookie)
    
    if (userCookie) {
      try {
        currentUser = JSON.parse(userCookie)
        console.log('User notifications API - currentUser:', currentUser)
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }
    
    if (!currentUser) {
      console.log('User notifications API - No current user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'UNREAD'
    const type = searchParams.get('type')?.split(',') || []

    const skip = (page - 1) * limit

    const where: any = {
      userId: currentUser.id,
      ...(status && { status }),
      ...(type.length > 0 && { type: { in: type } })
    }

    console.log('User notifications API - where clause:', where)
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          task: { 
            select: { 
              id: true, 
              taskName: true, 
              status: true, 
              priority: true,
              endDate: true
            } 
          }
        }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { 
          userId: currentUser.id, 
          status: 'UNREAD' 
        } 
      })
    ])
    
    console.log('User notifications API - notifications found:', notifications.length)
    console.log('User notifications API - unreadCount:', unreadCount)

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get user notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from cookie (custom auth)
    const userCookie = request.cookies.get('user')?.value
    let currentUser = null
    
    if (userCookie) {
      try {
        currentUser = JSON.parse(userCookie)
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, status } = body

    if (!notificationIds || !Array.isArray(notificationIds) || !status) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Update notifications status
    const updatedNotifications = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: currentUser.id
      },
      data: { status }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        updatedCount: updatedNotifications.count 
      } 
    })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
