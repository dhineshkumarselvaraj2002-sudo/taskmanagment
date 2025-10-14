"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

async function fetchUserDashboardStats() {
  const response = await fetch("/api/dashboard/stats?userId=current")
  if (!response.ok) {
    throw new Error("Failed to fetch user dashboard stats")
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

export function UserProgressChart() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["user-dashboard-stats"],
    queryFn: fetchUserDashboardStats,
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
            My Progress
          </CardTitle>
          <CardDescription>
            Your task completion progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to load progress data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  // Mock data for demonstration - in real app, this would come from the API
  const progressData = [
    { name: "Week 1", completed: 2, total: 5 },
    { name: "Week 2", completed: 4, total: 6 },
    { name: "Week 3", completed: 3, total: 4 },
    { name: "Week 4", completed: 5, total: 7 },
  ]

  const statusData = [
    { name: "Completed", value: stats.completedTasks, color: COLORS.COMPLETED },
    { name: "In Progress", value: stats.pendingTasks, color: COLORS.IN_PROGRESS },
    { name: "To Do", value: stats.myTasks - stats.completedTasks - stats.pendingTasks, color: COLORS.TODO },
  ]

  return (
    <div className="space-y-6">
      {/* Progress Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
          <CardDescription>
            Your task completion trend over the last 4 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Total Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Task Status Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of your tasks by status
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
