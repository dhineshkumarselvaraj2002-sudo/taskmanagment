"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { TrendingUp, BarChart3 } from "lucide-react"

async function fetchDashboardStats() {
  const response = await fetch("/api/dashboard/stats")
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }
  const data = await response.json()
  return data.data
}

const COLORS = {
  TODO: "#6B7280",
  IN_PROGRESS: "#3B82F6",
  IN_REVIEW: "#F59E0B",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
  BLOCKED: "#8B5CF6",
}

const PRIORITY_COLORS = {
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#F97316",
  CRITICAL: "#EF4444",
}

export function TaskChart() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Task Distribution
          </CardTitle>
          <CardDescription>
            Overview of tasks by status and priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to load chart data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const statusData = stats.tasksByStatus.map((item: any) => ({
    name: item.status.replace("_", " "),
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || "#6B7280",
  }))

  const priorityData = stats.tasksByPriority.map((item: any) => ({
    name: item.priority,
    value: item.count,
    color: PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] || "#6B7280",
  }))

  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tasks by Status
          </CardTitle>
          <CardDescription>
            Distribution of tasks across different statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {statusData.map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                {item.name}: {item.value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tasks by Priority
          </CardTitle>
          <CardDescription>
            Distribution of tasks across different priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {priorityData.map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                {item.name}: {item.value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}
