'use client'

import { useEffect, useState } from 'react'
import type { DashboardStats } from '@/types'
import { 
  CheckSquare, 
  Users, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
  Target
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
      <div className="bg-white shadow rounded-lg animate-pulse">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg p-4 animate-pulse"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1.5s'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-300 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-3 w-16 bg-gray-300 rounded mb-2 animate-pulse"></div>
                    <div className="h-6 w-12 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">Failed to load statistics</p>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Tasks',
      value: stats.totalTasks,
      icon: Target,
      color: 'text-blue -600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Completed',
      value: stats.completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'In Progress',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      name: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      name: 'Team Members',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Success Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ]

  return (
    <div className="bg-white shadow rounded-lg transition-all duration-300 hover:shadow-xl">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.name}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border border-transparent hover:border-blue-200"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0,
                transform: 'translateY(20px)'
              }}
            >
              <div className="flex items-center space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <stat.icon className={`h-4 w-4 ${stat.color} transition-all duration-300 group-hover:scale-110`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-gray-700">
                    {stat.name}
                  </p>
                  <p className="text-xl font-bold text-gray-900 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-105">
                    {stat.value}
                  </p>
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

