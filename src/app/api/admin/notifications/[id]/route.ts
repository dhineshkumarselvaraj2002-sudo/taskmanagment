import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: { status },
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
    console.error('Update notification error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
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
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.notification.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
