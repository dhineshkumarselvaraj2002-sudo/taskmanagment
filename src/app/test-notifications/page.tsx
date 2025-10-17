'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestNotificationsPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testTaskCreated = () => {
    console.log('Test - Dispatching taskCreated event')
    window.dispatchEvent(new CustomEvent('taskCreated', { 
      detail: { taskId: 'test-123', taskName: 'Test Task' } 
    }))
    addTestResult('Dispatched taskCreated event')
  }

  const testTaskUpdated = () => {
    console.log('Test - Dispatching taskUpdated event')
    window.dispatchEvent(new CustomEvent('taskUpdated', { 
      detail: { taskId: 'test-123', taskName: 'Updated Test Task' } 
    }))
    addTestResult('Dispatched taskUpdated event')
  }

  const testTaskDeleted = () => {
    console.log('Test - Dispatching taskDeleted event')
    window.dispatchEvent(new CustomEvent('taskDeleted', { 
      detail: { taskId: 'test-123', taskName: 'Deleted Test Task' } 
    }))
    addTestResult('Dispatched taskDeleted event')
  }

  const testTaskStatusChanged = () => {
    console.log('Test - Dispatching taskStatusChanged event')
    window.dispatchEvent(new CustomEvent('taskStatusChanged', { 
      detail: { taskId: 'test-123', newStatus: 'COMPLETED' } 
    }))
    addTestResult('Dispatched taskStatusChanged event')
  }

  const testNotificationRefresh = () => {
    console.log('Test - Dispatching notificationRefresh event')
    window.dispatchEvent(new CustomEvent('notificationRefresh'))
    addTestResult('Dispatched notificationRefresh event')
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification System Test</CardTitle>
            <CardDescription>
              Test the real-time notification system by dispatching custom events.
              Check the browser console and notification bell for responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button onClick={testTaskCreated} className="bg-green-600 hover:bg-green-700">
                Test Task Created
              </Button>
              <Button onClick={testTaskUpdated} className="bg-blue-600 hover:bg-blue-700">
                Test Task Updated
              </Button>
              <Button onClick={testTaskDeleted} className="bg-red-600 hover:bg-red-700">
                Test Task Deleted
              </Button>
              <Button onClick={testTaskStatusChanged} className="bg-yellow-600 hover:bg-yellow-700">
                Test Status Changed
              </Button>
              <Button onClick={testNotificationRefresh} className="bg-purple-600 hover:bg-purple-700">
                Test Notification Refresh
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No test results yet. Click a button above to test.</p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Open the notification bell in the header</li>
                <li>2. Click any test button above</li>
                <li>3. Watch the notification bell for immediate updates</li>
                <li>4. Check the browser console for debug logs</li>
                <li>5. The notification bell should refresh within 500ms</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}