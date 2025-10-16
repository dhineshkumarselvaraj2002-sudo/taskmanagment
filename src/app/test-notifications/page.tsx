'use client'

import { useState, useEffect } from 'react'

export default function TestNotificationsPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug-notifications')
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Failed to fetch debug data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestNotification = async () => {
    try {
      if (!debugData?.data?.users?.length) {
        alert('No users found. Please fetch debug data first.')
        return
      }

      const firstUser = debugData.data.users[0]
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: firstUser.id,
          title: 'Test Notification',
          message: `Test notification created at ${new Date().toLocaleString()}`
        })
      })

      const result = await response.json()
      setTestResult(result)
      
      // Refresh debug data
      await fetchDebugData()
    } catch (error) {
      console.error('Failed to create test notification:', error)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notification System Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Debug Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">System Status</h2>
              <button
                onClick={fetchDebugData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {debugData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600">Total Notifications</div>
                    <div className="text-2xl font-bold text-blue-900">{debugData.data.stats.totalNotifications}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600">Unread Notifications</div>
                    <div className="text-2xl font-bold text-green-900">{debugData.data.stats.unreadNotifications}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600">Total Users</div>
                    <div className="text-2xl font-bold text-purple-900">{debugData.data.stats.totalUsers}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-sm text-orange-600">Total Tasks</div>
                    <div className="text-2xl font-bold text-orange-900">{debugData.data.stats.totalTasks}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Notification */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Notification</h2>
            
            <button
              onClick={createTestNotification}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
            >
              Create Test Notification
            </button>
            
            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {debugData && debugData.data.notifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
            <div className="space-y-3">
              {debugData.data.notifications.slice(0, 10).map((notification: any) => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        To: {notification.user?.name} ({notification.user?.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        notification.status === 'UNREAD' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {notification.status}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users List */}
        {debugData && debugData.data.users.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {debugData.data.users.map((user: any) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Role: {user.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
