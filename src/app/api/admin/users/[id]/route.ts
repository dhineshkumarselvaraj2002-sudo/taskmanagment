import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserFormData } from '@/types'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            createdTasks: true,
            notifications: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: Partial<UserFormData> = await request.json()
    const { name, email, password, role, isActive, emailNotifications } = body

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: params.id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(emailNotifications !== undefined && { emailNotifications })
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            assignedTasks: true,
            createdTasks: true,
            notifications: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is trying to delete themselves
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user has assigned tasks
    const assignedTasks = await prisma.task.count({
      where: { assignedToId: params.id }
    })

    if (assignedTasks > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with assigned tasks. Please reassign tasks first.' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
