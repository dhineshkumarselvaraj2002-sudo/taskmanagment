'use client'

import { useEffect, useState } from 'react'
import { DashboardStats } from '@/types'
import { 
  CheckSquare, 
  Users, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react'

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24" />
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div className="text-red-500">Failed to load dashboard statistics</div>
  }

  const statCards = [
    {
      name: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
        >
          <dt>
            <div className={`absolute rounded-md ${stat.bgColor} p-3`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  )
}
