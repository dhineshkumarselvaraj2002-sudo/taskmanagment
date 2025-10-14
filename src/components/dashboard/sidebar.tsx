"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  Bell,
  Settings,
} from "lucide-react"

const adminNavItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    href: "/admin/tasks",
    icon: CheckSquare,
  },
  {
    name: "Calendar",
    href: "/admin/calendar",
    icon: Calendar,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
]

const userNavItems = [
  {
    name: "Dashboard",
    href: "/user/dashboard",
    icon: LayoutDashboard,
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
  },
]

export function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navItems = session?.user?.role === "ADMIN" ? adminNavItems : userNavItems

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
