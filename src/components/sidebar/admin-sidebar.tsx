"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  CheckSquare, 
  Settings, 
  Shield,
  Database,
  UserCog,
  Bell,
  Clock,
  Home,
  Activity,
  LogOut
} from "lucide-react"

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Tasks",
    href: "/admin/tasks",
    icon: CheckSquare,
  },
  {
    name: "System",
    href: "/admin/system",
    icon: Database,
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    badge: "5",
  },
]

const adminSecondaryNavigation = [
  {
    name: "User Management",
    href: "/admin/user-management",
    icon: UserCog,
  },
  {
    name: "Security",
    href: "/admin/security",
    icon: Shield,
  },
  {
    name: "Time Tracking",
    href: "/admin/time-tracking",
    icon: Clock,
  },
  {
    name: "Activity Logs",
    href: "/admin/activity-logs",
    icon: Activity,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-foreground">TaskFlow Pro</span>
          <Badge variant="secondary" className="ml-2">Admin</Badge>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Management
          </h3>
        </div>
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <nav className="space-y-1 px-3 pb-4">
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Administration
          </h3>
        </div>
        {adminSecondaryNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {session?.user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || "admin@example.com"}
            </p>
            <Badge variant="outline" className="mt-1 text-xs">
              Administrator
            </Badge>
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
