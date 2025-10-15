"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  CheckSquare, 
  Bell, 
  Settings, 
  User,
  Home,
  LogOut
} from "lucide-react"

const userNavigation = [
  {
    name: "Dashboard",
    href: "/user/dashboard",
    icon: Home,
  },
  {
    name: "My Tasks",
    href: "/user/tasks",
    icon: CheckSquare,
  },
  {
    name: "Notifications",
    href: "/user/notifications",
    icon: Bell,
    badge: "3",
  },
]

export function UserSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-foreground">TaskFlow Pro</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {userNavigation.map((item) => {
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

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || "user@example.com"}
            </p>
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <Button variant="ghost" size="sm" asChild className="w-full justify-start">
            <Link href="/user/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="w-full justify-start">
            <Link href="/user/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
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
