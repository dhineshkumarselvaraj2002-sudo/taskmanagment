'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestRealtimeNotifications() {
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const sendTestNotification = async () => {
    if (!userId.trim()) {
      setResult('Please enter a user ID')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.trim(),
          message: message || 'This is a test notification to verify real-time delivery',
          title: title || 'Test Notification'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(`✅ Notification sent successfully! Check the notification bell for user ${userId}`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Failed to send notification: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-200 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Real-time Notifications</CardTitle>
            <CardDescription>
              Send a test notification to verify the real-time notification system is working.
              The notification should appear immediately in the notification bell of the target user.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium mb-2">
                User ID (required)
              </label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter user ID to send notification to"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Notification Title (optional)
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Notification Message (optional)
              </label>
              <Input
                id="message"
                type="text"
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button 
              onClick={sendTestNotification} 
              disabled={loading || !userId.trim()}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Test Notification'}
            </Button>

            {result && (
              <div className={`p-3 rounded-md ${
                result.includes('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {result}
              </div>
            )}

            <div className="mt-6 p-4bg-stone-200 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">How to test:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Open the app in two different browser tabs/windows</li>
                <li>2. Login as different users (admin and regular user)</li>
                <li>3. Use this page to send a notification to one user</li>
                <li>4. Check if the notification appears immediately in the other user's notification bell</li>
                <li>5. The notification should appear without refreshing the page</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
