'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  Bell, 
  Settings,
  BarChart3,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  User as UserIcon,
  Mail,
  Shield,
  Clock,
  Type,
  Minus,
  Plus,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'

// TailAdmin-style Sidebar Content Dictionary
const sidebarContent = {
  // Brand Information (TailAdmin style)
  brand: {
    logo: 'TZ',
    title: 'TaskZen',
  },
  
  // Navigation Sections (TailAdmin structure)
  navigation: {
    menu: [
      { 
        name: 'Dashboard', 
        href: '/admin', 
        icon: LayoutDashboard,
        description: 'Overview and analytics',
        badge: null,
        hasSubmenu: false
      },
      { 
        name: 'Calendar', 
        href: '/admin/calendar', 
        icon: Calendar,
        description: 'Schedule and events',
        badge: null,
        hasSubmenu: false
      },
      {
        name:'Users',
        href: '/admin/users',
        icon: Users,
        description: 'User management',
        badge: null,
        hasSubmenu: false

      },
      {
        name: 'Tasks',
        href: '/admin/tasks',
        icon: List,
        description: 'Task management',
        badge: null,
        hasSubmenu: false
      },
      { 
        name: 'Admin Profile', 
        href: '/admin/profile', 
        icon: UserIcon,
        description: 'Admin profile management',
        badge: null,
        hasSubmenu: false
      }
    ],
    others: [
      { 
        name: 'Charts', 
        href: '/admin/charts', 
        icon: BarChart3,
        description: 'Analytics and charts',
        badge: null,
        hasSubmenu: true
      },
      { 
        name: 'UI Elements', 
        href: '/admin/ui-elements', 
        icon: Settings,
        description: 'UI components',
        badge: null,
        hasSubmenu: true
      },
      { 
        name: 'Authentication', 
        href: '/admin/auth', 
        icon: Shield,
        description: 'Authentication pages',
        badge: null,
        hasSubmenu: true
      }
    ]
  },
  
  // Sidebar Modes
  modes: {
    expanded: {
      name: 'Expanded',
      description: 'Full sidebar with all details',
      icon: Maximize2
    },
    collapsed: {
      name: 'Collapsed',
      description: 'Minimal sidebar with icons only',
      icon: Minimize2
    },
    floating: {
      name: 'Floating',
      description: 'Expand on hover, collapse when idle',
      icon: PanelLeftOpen
    },
    overlay: {
      name: 'Overlay',
      description: 'Sidebar overlays content',
      icon: PanelLeftClose
    }
  },
  
  // Font Sizes
  fontSizes: {
    small: {
      name: 'Small',
      description: 'Compact text size',
      icon: Minus
    },
    medium: {
      name: 'Medium',
      description: 'Standard text size',
      icon: Type
    },
    large: {
      name: 'Large',
      description: 'Large text size',
      icon: Plus
    }
  },
  
  // Profile Information
  profile: {
    sections: {
      basic: {
        title: 'Profile Details',
        fields: [
          {
            icon: UserIcon,
            label: 'Full Name',
            value: 'name'
          },
          {
            icon: Mail,
            label: 'Email Address',
            value: 'email'
          },
          {
            icon: Shield,
            label: 'Role',
            value: 'role'
          },
          {
            icon: Clock,
            label: 'Last Active',
            value: 'lastActive'
          }
        ]
      },
      actions: {
        title: 'Quick Actions',
        items: [
          {
            icon: Settings,
            label: 'Account Settings',
            action: 'settings'
          },
          {
            icon: Shield,
            label: 'Security Settings',
            action: 'security'
          },
          {
            icon: Bell,
            label: 'Notifications',
            action: 'notifications'
          }
        ]
      }
    }
  },
  
  // UI Messages
  messages: {
    loading: 'Loading...',
    notAvailable: 'Not available',
    lastActive: 'Just now',
    defaultEmail: 'admin@taskmanager.com',
    defaultName: 'Admin User'
  },
  
  // Tooltips and Help Text
  tooltips: {
    sidebarToggle: 'Toggle sidebar visibility',
    fontSize: 'Adjust text size',
    profile: 'View profile details',
    mode: 'Change sidebar layout mode',
    cycle: 'Cycle through sidebar modes'
  }
}

// Legacy navigation for backward compatibility
const navigation = sidebarContent.navigation.menu

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  image?: string
}

type SidebarMode = 'expanded' | 'collapsed' | 'floating' | 'overlay'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('collapsed')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showProfileTab, setShowProfileTab] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Get saved preferences
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large' | null
    if (savedFontSize) {
      setFontSize(savedFontSize)
    }

    const savedSidebarMode = localStorage.getItem('sidebarMode') as SidebarMode | null
    if (savedSidebarMode) {
      setSidebarMode(savedSidebarMode)
    }

    // Auto-collapse on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarMode('overlay')
      } else if (window.innerWidth < 1280) {
        setSidebarMode('collapsed')
      }
    }

    // Listen for sidebar mode changes from header
    const handleSidebarModeChange = (event: CustomEvent) => {
      setSidebarMode(event.detail)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('sidebarModeChange', handleSidebarModeChange as EventListener)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('sidebarModeChange', handleSidebarModeChange as EventListener)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const cycleSidebarMode = useCallback(() => {
    const modes: SidebarMode[] = ['expanded', 'collapsed', 'floating', 'overlay']
    const currentIndex = modes.indexOf(sidebarMode)
    const nextIndex = (currentIndex + 1) % modes.length
    const newMode = modes[nextIndex]
    
    setSidebarMode(newMode)
    localStorage.setItem('sidebarMode', newMode)
  }, [sidebarMode])

  const setSidebarModeDirect = useCallback((mode: SidebarMode) => {
    setSidebarMode(mode)
    localStorage.setItem('sidebarMode', mode)
  }, [])

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const toggleProfileTab = () => {
    setShowProfileTab(!showProfileTab)
  }

  // Hover handlers for expand/collapse behavior
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (sidebarMode === 'collapsed') {
      setIsExpanded(true)
      // Trigger event to update main content width
      window.dispatchEvent(new CustomEvent('sidebarHoverExpand', { detail: true }))
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (sidebarMode === 'collapsed') {
      setIsExpanded(false)
      // Trigger event to update main content width
      window.dispatchEvent(new CustomEvent('sidebarHoverExpand', { detail: false }))
    }
  }

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size)
    localStorage.setItem('fontSize', size)
  }

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'small':
        return {
          title: 'text-base',
          subtitle: 'text-xs',
          nav: 'text-xs',
          profileName: 'text-xs',
          profileEmail: 'text-[10px]',
          badge: 'text-[10px]'
        }
      case 'large':
        return {
          title: 'text-2xl',
          subtitle: 'text-base',
          nav: 'text-base',
          profileName: 'text-base',
          profileEmail: 'text-sm',
          badge: 'text-sm'
        }
      default: // medium
        return {
          title: 'text-xl',
          subtitle: 'text-base',
          nav: 'text-base',
          profileName: 'text-base',
          profileEmail: 'text-sm',
          badge: 'text-sm'
        }
    }
  }

  const fontClasses = getFontSizeClasses()

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileSidebar}
          className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-gray-700 hover:scale-110 active:scale-95 hover:rotate-3 animate-bounce-in"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-slate-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleMobileSidebar}
        />
      )}

       {/* Sidebar */}
       <div 
         className={cn(
           "fixed inset-y-0 z-40 flex flex-col transition-all duration-300 ease-in-out transform",
           // Mobile styles
           "w-72 -translate-x-full lg:translate-x-0",
           isMobileOpen && "translate-x-0 animate-slide-in-left",
         // Desktop styles based on mode - TailAdmin widths
         "lg:z-50",
         sidebarMode === 'expanded' && "lg:w-72", // 288px
         sidebarMode === 'collapsed' && !isExpanded && "lg:w-16", // 64px when collapsed
         sidebarMode === 'collapsed' && isExpanded && "lg:w-72 lg:shadow-2xl", // 288px when hovered with shadow
         sidebarMode === 'floating' && "lg:w-72 lg:shadow-2xl lg:border-r-2 lg:border-blue-200/50",
         sidebarMode === 'overlay' && "lg:w-72 lg:shadow-2xl lg:border-r-2 lg:border-blue-200/50"
         )}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
       >
        <div className="flex h-full flex-col overflow-y-auto bg-white dark:bg-gray-800 shadow-lg border-r border-gray-300 dark:border-gray-700">
          {/* Header - TailAdmin Style */}
           <div className={cn(
             "flex shrink-0 items-center transition-all duration-300 border-b border-gray-200 dark:border-gray-700",
             (sidebarMode === 'collapsed' && !isExpanded) ? "h-16 justify-center px-4" : "h-16 px-6"
           )}>
             {!(sidebarMode === 'collapsed' && !isExpanded) && (
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-white font-bold text-xs">{sidebarContent.brand.logo}</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h3 className={`${fontClasses.title} font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate text-sm pt-3`}>
                    {sidebarContent.brand.title}
                  </h3>
                </div>
              </div>
            )}
             
             {(sidebarMode === 'collapsed' && !isExpanded) && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">{sidebarContent.brand.logo}</span>
              </div>
            )}

             {/* TailAdmin-style Toggle Button */}
             <div className={cn(
               "flex items-center",
               (sidebarMode === 'collapsed' && !isExpanded) && "hidden"
             )}>
              {/* <button
                onClick={cycleSidebarMode}
                className="p-2 rounded-lg hover:bg-stone-200 transition-colors duration-200"
                title="Toggle sidebar"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button> */}
            </div>

            {/* Mobile Close Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileSidebar}
                className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Close menu"
              >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Navigation - TailAdmin Style */}
           <nav className={cn(
             "flex flex-1 flex-col transition-all duration-300",
             (sidebarMode === 'collapsed' && !isExpanded) ? "px-2 py-6" : "px-6 py-6"
           )}>
             {/* MENU Section */}
             <div className="mb-8">
              <ul role="list" className="space-y-2">
                {sidebarContent.navigation.menu.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10',
                          'group flex items-center gap-x-3 rounded-lg font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md active:scale-95',
                          (sidebarMode === 'collapsed' && !isExpanded) ? 'justify-center p-3 mx-1' : 'px-4 py-3 mx-1'
                        )}
                        title={(sidebarMode === 'collapsed' && !isExpanded) ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                            'h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3'
                          )}
                          aria-hidden="true"
                        />
                        {!(sidebarMode === 'collapsed' && !isExpanded) && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className={`truncate ${fontClasses.nav}`}>{item.name}</span>
                            {item.hasSubmenu && (
                              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* OTHERS Section */}
           
          </nav>
          
          {/* TailAdmin Bottom Section */}
          <div className={cn(
            "mt-auto transition-all duration-300 border-t border-gray-200 dark:border-gray-700",
            (sidebarMode === 'collapsed' && !isExpanded) ? "px-2 py-6" : "px-6 py-6"
          )}>
            {/* Text Size Control */}
            <div className="space-y-4">
              {/* Text Size Control */}
              <div className="space-y-2">
                <div className={cn(
                  "flex items-center justify-between",
                  (sidebarMode === 'collapsed' && !isExpanded) && "justify-center"
                )}>
                  {!(sidebarMode === 'collapsed' && !isExpanded) && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Text Size
                    </span>
                  )}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleFontSizeChange('small')}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                        fontSize === 'small' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      )}
                      title="Small text"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('medium')}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                        fontSize === 'medium' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      )}
                      title="Medium text"
                    >
                      <Type className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('large')}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                        fontSize === 'large' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      )}
                      title="Large text"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                {/* Current Size Indicator */}
                {!(sidebarMode === 'collapsed' && !isExpanded) && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {fontSize} size
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}