'use client'

import { useState } from 'react'
import { Database, CheckCircle } from 'lucide-react'

export default function SeedTasksButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSeedTasks = async () => {
    if (!confirm('This will create sample tasks for all users (2 tasks per user). Continue?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/seed-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          // Refresh the page to show new tasks
          window.location.reload()
        }, 2000)
      } else {
        alert(data.error || 'Failed to seed tasks')
      }
    } catch (error) {
      console.error('Failed to seed tasks:', error)
      alert('Failed to seed tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSeedTasks}
      disabled={loading || success}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {success ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Tasks Created!
        </>
      ) : (
        <>
          <Database className="h-4 w-4 mr-2" />
          {loading ? 'Creating...' : 'Seed Sample Tasks'}
        </>
      )}
    </button>
  )
}
