import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
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
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = currentUser.id

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Store the connection
      connections.set(userId, controller)
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'Connected to notification stream',
        timestamp: new Date().toISOString()
      })
      
      controller.enqueue(`data: ${data}\n\n`)
      
      console.log(`User ${userId} connected to notification stream`)
    },
    
    cancel() {
      // Clean up when connection is closed
      connections.delete(userId)
      console.log(`User ${userId} disconnected from notification stream`)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

// Function to send notification to a specific user
export async function sendNotificationToUser(userId: string, notification: any) {
  const controller = connections.get(userId)
  
  if (controller) {
    try {
      const data = JSON.stringify({
        type: 'notification',
        data: notification,
        timestamp: new Date().toISOString()
      })
      
      controller.enqueue(`data: ${data}\n\n`)
      console.log(`Notification sent to user ${userId}:`, notification.title)
    } catch (error) {
      console.error('Error sending notification:', error)
      // Remove broken connection
      connections.delete(userId)
    }
  } else {
    console.log(`User ${userId} not connected to notification stream`)
  }
}

// Function to broadcast notification to all connected users
export async function broadcastNotification(notification: any) {
  const data = JSON.stringify({
    type: 'notification',
    data: notification,
    timestamp: new Date().toISOString()
  })
  
  for (const [userId, controller] of connections.entries()) {
    try {
      controller.enqueue(`data: ${data}\n\n`)
      console.log(`Broadcast notification sent to user ${userId}:`, notification.title)
    } catch (error) {
      console.error(`Error sending broadcast to user ${userId}:`, error)
      connections.delete(userId)
    }
  }
}

// Export the connections map for use in other API routes
export { connections }
