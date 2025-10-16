'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Bell, 
  Settings,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Type
} from 'lucide-react'
import { cn } from '@/lib/utils'

// User Sidebar Content Dictionary
const sidebarContent = {
  // Brand Information
  brand: {
    logo: 'UZ',
    title: 'UserZone',
  },
  
  // Navigation Sections
  navigation: {
    menu: [
      { 
        name: 'Dashboard', 
        href: '/user/dashboard', 
        icon: LayoutDashboard,
        description: 'Overview and analytics',
        badge: null,
        hasSubmenu: false
      },
      { 
        name: 'My Tasks', 
        href: '/user/tasks', 
        icon: CheckSquare,
        description: 'Task management',
        badge: null,
        hasSubmenu: false
      },
      { 
        name: 'Calendar', 
        href: '/user/calendar', 
        icon: Calendar,
        description: 'Schedule and events',
        badge: null,
        hasSubmenu: false
      },
      { 
        name: 'Profile', 
        href: '/user/profile', 
        icon: UserIcon,
        description: 'User profile management',
        badge: null,
        hasSubmenu: false
      }
    ],
    others: []
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
            icon: Settings,
            label: 'Role',
            value: 'role'
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
    defaultEmail: 'user@taskmanager.com',
    defaultName: 'User'
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

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  image?: string
}

type SidebarMode = 'expanded' | 'collapsed' | 'floating' | 'overlay'

export default function UserSidebar() {
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
    const savedFontSize = localStorage.getItem('userFontSize') as 'small' | 'medium' | 'large' | null
    if (savedFontSize) {
      setFontSize(savedFontSize)
    }

    const savedSidebarMode = localStorage.getItem('userSidebarMode') as SidebarMode | null
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
    window.addEventListener('userSidebarModeChange', handleSidebarModeChange as EventListener)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('userSidebarModeChange', handleSidebarModeChange as EventListener)
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
    localStorage.setItem('userSidebarMode', newMode)
  }, [sidebarMode])

  const setSidebarModeDirect = useCallback((mode: SidebarMode) => {
    setSidebarMode(mode)
    localStorage.setItem('userSidebarMode', mode)
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
      window.dispatchEvent(new CustomEvent('userSidebarHoverExpand', { detail: true }))
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (sidebarMode === 'collapsed') {
      setIsExpanded(false)
      // Trigger event to update main content width
      window.dispatchEvent(new CustomEvent('userSidebarHoverExpand', { detail: false }))
    }
  }

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size)
    localStorage.setItem('userFontSize', size)
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
          className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200/60 dark:border-gray-700 hover:scale-105 active:scale-95"
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
           "fixed inset-y-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
           // Mobile styles
           "w-72 -translate-x-full lg:translate-x-0",
           isMobileOpen && "translate-x-0",
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
          {/* Header */}
           <div className={cn(
             "flex shrink-0 items-center transition-all duration-300",
             (sidebarMode === 'collapsed' && !isExpanded) ? "h-16 justify-center px-4" : "h-16 px-6"
           )}>
             {!(sidebarMode === 'collapsed' && !isExpanded) && (
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-lg flex items-center justify-center shadow-sm shrink-0">
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
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">{sidebarContent.brand.logo}</span>
              </div>
            )}

            {/* Mobile Close Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Close menu"
              >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Navigation */}
           <nav className={cn(
             "flex flex-1 flex-col transition-all duration-300",
             (sidebarMode === 'collapsed' && !isExpanded) ? "px-2 py-4" : "px-4 py-4"
           )}>
             {/* MENU Section */}
             <div className="mb-6">
              <ul role="list" className="space-y-1">
                {sidebarContent.navigation.menu.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-l-4 border-green-400 dark:border-green-500'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
                          'group flex items-center gap-x-3 rounded-lg font-medium transition-all duration-200',
                          (sidebarMode === 'collapsed' && !isExpanded) ? 'justify-center p-3' : 'px-3 py-2.5'
                        )}
                        title={(sidebarMode === 'collapsed' && !isExpanded) ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400',
                            'h-5 w-5 shrink-0 transition-colors duration-200'
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
            <div className="mb-6">
              <ul role="list" className="space-y-1">
                {sidebarContent.navigation.others.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-l-4 border-green-400 dark:border-green-500'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
                          'group flex items-center gap-x-3 rounded-lg font-medium transition-all duration-200',
                          (sidebarMode === 'collapsed' && !isExpanded) ? 'justify-center p-3' : 'px-3 py-2.5'
                        )}
                        title={(sidebarMode === 'collapsed' && !isExpanded) ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400',
                            'h-5 w-5 shrink-0 transition-colors duration-200'
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
          </nav>
          
          {/* Bottom Section */}
          <div className={cn(
            "mt-auto transition-all duration-300",
            (sidebarMode === 'collapsed' && !isExpanded) ? "px-2 py-4" : "px-4 py-4"
          )}>
            {!(sidebarMode === 'collapsed' && !isExpanded) && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className={`${fontClasses.nav} font-bold text-green-800 dark:text-green-200`}>
                  #1 User Dashboard
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  )
}
