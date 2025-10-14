"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users")
      return res.json()
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage system users and their roles
        </p>
      </div>

      <div className="grid gap-4">
        {users?.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">{user._count.assignedTasks}</span>
                    <span className="text-muted-foreground"> assigned tasks</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{user._count.createdTasks}</span>
                    <span className="text-muted-foreground"> created tasks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
