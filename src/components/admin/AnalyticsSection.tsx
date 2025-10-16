'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar
} from 'recharts'

interface AnalyticsData {
  taskStatusDistribution: { status: string; count: number; percentage: number }[]
  priorityDistribution: { priority: string; count: number; percentage: number }[]
  userPerformance: { user: string; completedTasks: number; totalTasks: number; completionRate: number }[]
  monthlyTrends: { month: string; completed: number; created: number }[]
  categoryBreakdown: { category: string; count: number; percentage: number }[]
  overdueAnalysis: { daysOverdue: string; count: number }[]
  completionRate: number
  averageCompletionTime: number
  peakProductivityHours: { hour: number; taskCount: number }[]
}

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        const data = await response.json()
        if (data.success) {
          setAnalytics(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-red-50 rounded-lg p-6 text-center">
        <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 font-medium">Failed to load analytics data</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'users', label: 'Team', icon: Users },
    { id: 'trends', label: 'Trends', icon: Activity }
  ]

  // Chart color palettes
  const COLORS = {
    status: ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#6B7280', '#EF4444'],
    priority: ['#10B981', '#F59E0B', '#F97316', '#EF4444'],
    performance: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'TODO': 'bg-blue-500',
      'IN_PROGRESS': 'bg-yellow-500',
      'IN_REVIEW': 'bg-purple-500',
      'COMPLETED': 'bg-green-500',
      'CANCELLED': 'bg-gray-500',
      'BLOCKED': 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'bg-green-500',
      'MEDIUM': 'bg-yellow-500',
      'HIGH': 'bg-orange-500',
      'CRITICAL': 'bg-red-500'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-500'
  }

  // Prepare data for charts
  const statusChartData = analytics.taskStatusDistribution.map((item, index) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
    fill: COLORS.status[index % COLORS.status.length]
  }))

  const priorityChartData = analytics.priorityDistribution.map((item, index) => ({
    name: item.priority,
    value: item.count,
    percentage: item.percentage,
    fill: COLORS.priority[index % COLORS.priority.length]
  }))

  const userPerformanceData = analytics.userPerformance.map((user, index) => ({
    name: user.user,
    completed: user.completedTasks,
    total: user.totalTasks,
    rate: user.completionRate,
    fill: COLORS.performance[index % COLORS.performance.length]
  }))

  const monthlyTrendsData = analytics.monthlyTrends.map(trend => ({
    month: trend.month,
    completed: trend.completed,
    created: trend.created
  }))

  const categoryData = analytics.categoryBreakdown.map((item, index) => ({
    name: item.category || 'Uncategorized',
    value: item.count,
    percentage: item.percentage,
    fill: COLORS.performance[index % COLORS.performance.length]
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your task management system</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-100">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Distribution - Pie Chart */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Task Status Distribution</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Distribution - Bar Chart */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics - Radial Charts */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ name: 'Completion', value: analytics.completionRate, fill: '#10B981' }]}>
                      <RadialBar dataKey="value" fill="#10B981" />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold">
                        {analytics.completionRate}%
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ name: 'Avg Time', value: Math.min(analytics.averageCompletionTime * 10, 100), fill: '#3B82F6' }]}>
                      <RadialBar dataKey="value" fill="#3B82F6" />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold">
                        {analytics.averageCompletionTime}d
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-gray-500">Avg. Days to Complete</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown - Donut Chart */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Performance - Horizontal Bar Chart */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userPerformanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Productivity Hours - Area Chart */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Productivity Hours</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.peakProductivityHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="taskCount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Performance Table */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Completed</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.userPerformance.map((user) => (
                    <tr key={user.user} className="border-b border-gray-50">
                      <td className="py-2 text-sm text-gray-900">{user.user}</td>
                      <td className="py-2 text-sm text-gray-500">{user.completedTasks}/{user.totalTasks}</td>
                      <td className="py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                          user.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overdue Analysis */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Analysis</h3>
            <div className="space-y-3">
              {analytics.overdueAnalysis.map((item) => (
                <div key={item.daysOverdue} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.daysOverdue}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...analytics.overdueAnalysis.map(o => o.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-6">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Monthly Trends - Line Chart */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} name="Completed Tasks" />
                  <Line type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={3} name="Created Tasks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Over Time - Area Chart */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Completed" />
                  <Area type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Created" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
