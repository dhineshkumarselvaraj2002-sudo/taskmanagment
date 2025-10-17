import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie (consistent with other API routes)
    const userCookie = request.cookies.get('user')?.value
    let user = null
    
    if (userCookie) {
      try {
        user = JSON.parse(userCookie)
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }
    
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get user data with admin-specific information
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailNotifications: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        image: true,
        emailVerified: true
      }
    })

    if (!userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Get system statistics for admin
    const [
      totalUsers,
      totalTasks,
      completedTasks,
      activeUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { isActive: true } })
    ])

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const adminData = {
      ...userData,
      totalUsers,
      totalTasks,
      completedTasks,
      activeUsers,
      completionRate,
      systemUptime: '99.9%', // This could be calculated from actual system metrics
      adminSettings: {
        canManageUsers: true,
        canManageTasks: true,
        canViewAnalytics: true,
        canManageSystem: true
      }
    }

    return NextResponse.json({ success: true, data: adminData })
  } catch (error) {
    console.error('Failed to fetch admin profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from cookie (consistent with other API routes)
    const userCookie = request.cookies.get('user')?.value
    let user = null
    
    if (userCookie) {
      try {
        user = JSON.parse(userCookie)
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }
    
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, emailNotifications } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email is already taken' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        emailNotifications: emailNotifications ?? true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailNotifications: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        image: true,
        emailVerified: true
      }
    })

    // Get updated system statistics
    const [
      totalUsers,
      totalTasks,
      completedTasks,
      activeUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { isActive: true } })
    ])

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const adminData = {
      ...updatedUser,
      totalUsers,
      totalTasks,
      completedTasks,
      activeUsers,
      completionRate,
      systemUptime: '99.9%',
      adminSettings: {
        canManageUsers: true,
        canManageTasks: true,
        canViewAnalytics: true,
        canManageSystem: true
      }
    }

    return NextResponse.json({ success: true, data: adminData })
  } catch (error) {
    console.error('Failed to update admin profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
