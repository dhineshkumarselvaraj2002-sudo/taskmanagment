import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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
    
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile data
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            createdTasks: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate completion rate
    const completedTasks = await prisma.task.count({
      where: {
        assignedToId: currentUser.id,
        status: 'COMPLETED'
      }
    })

    const completionRate = user._count.assignedTasks > 0 
      ? Math.round((completedTasks / user._count.assignedTasks) * 100)
      : 0

    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailNotifications: user.emailNotifications,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalTasks: user._count.assignedTasks,
      completedTasks,
      completionRate
    }

    return NextResponse.json({ success: true, data: profileData })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
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
    
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, emailNotifications } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        email,
        emailNotifications
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailNotifications: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
