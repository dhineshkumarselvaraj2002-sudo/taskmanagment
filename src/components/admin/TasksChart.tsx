'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface ChartData {
  name: string
  value: number
  color: string
}

export default function TasksChart() {
  const [tasksByStatus, setTasksByStatus] = useState<ChartData[]>([])
  const [tasksByPriority, setTasksByPriority] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/admin/tasks')
        const data = await response.json()
        if (data.success) {
          const tasks = data.data
          
          // Group by status
          const statusCounts = tasks.reduce((acc: any, task: any) => {
            acc[task.status] = (acc[task.status] || 0) + 1
            return acc
          }, {})
          
          const statusData = Object.entries(statusCounts).map(([status, count]) => ({
            name: status.replace('_', ' '),
            value: count as number,
            color: getStatusColor(status)
          }))
          
          // Group by priority
          const priorityCounts = tasks.reduce((acc: any, task: any) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1
            return acc
          }, {})
          
          const priorityData = Object.entries(priorityCounts).map(([priority, count]) => ({
            name: priority,
            value: count as number,
            color: getPriorityColor(priority)
          }))
          
          setTasksByStatus(statusData)
          setTasksByPriority(priorityData)
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10B981'
      case 'IN_PROGRESS':
        return '#3B82F6'
      case 'IN_REVIEW':
        return '#F59E0B'
      case 'BLOCKED':
        return '#EF4444'
      case 'TODO':
        return '#6B7280'
      default:
        return '#9CA3AF'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return '#DC2626'
      case 'HIGH':
        return '#EA580C'
      case 'MEDIUM':
        return '#D97706'
      case 'LOW':
        return '#059669'
      default:
        return '#6B7280'
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks by Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Tasks by Status</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tasks by Priority */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Tasks by Priority</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
