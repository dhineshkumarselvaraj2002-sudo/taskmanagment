'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

type SidebarMode = 'expanded' | 'collapsed' | 'floating' | 'overlay'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('collapsed')
  const [isHoverExpanded, setIsHoverExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    // Get saved sidebar mode
    const savedSidebarMode = localStorage.getItem('sidebarMode') as SidebarMode | null
    if (savedSidebarMode) {
      setSidebarMode(savedSidebarMode)
    }

    // Listen for sidebar mode changes
    const handleSidebarModeChange = (event: CustomEvent) => {
      setSidebarMode(event.detail)
    }

    // Listen for hover expand events
    const handleSidebarHoverExpand = (event: CustomEvent) => {
      setIsHoverExpanded(event.detail)
    }

    window.addEventListener('sidebarModeChange', handleSidebarModeChange as EventListener)
    window.addEventListener('sidebarHoverExpand', handleSidebarHoverExpand as EventListener)
    
    return () => {
      window.removeEventListener('sidebarModeChange', handleSidebarModeChange as EventListener)
      window.removeEventListener('sidebarHoverExpand', handleSidebarHoverExpand as EventListener)
    }
  }, [])

  // Sidebar toggle functions
  const cycleSidebarMode = () => {
    const modes: SidebarMode[] = ['expanded', 'collapsed', 'floating', 'overlay']
    const currentIndex = modes.indexOf(sidebarMode)
    const nextIndex = (currentIndex + 1) % modes.length
    const newMode = modes[nextIndex]
    
    setSidebarMode(newMode)
    localStorage.setItem('sidebarMode', newMode)
    
    // Trigger a custom event to notify the sidebar
    window.dispatchEvent(new CustomEvent('sidebarModeChange', { detail: newMode }))
  }

  const setSidebarModeDirect = (mode: SidebarMode) => {
    setSidebarMode(mode)
    localStorage.setItem('sidebarMode', mode)
    
    // Trigger a custom event to notify the sidebar
    window.dispatchEvent(new CustomEvent('sidebarModeChange', { detail: mode }))
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const getMainContentClasses = () => {
    switch (sidebarMode) {
      case 'expanded':
        return 'lg:pl-72' // 288px - TailAdmin expanded width
      case 'collapsed':
        // If hovered and expanded, use full width, otherwise collapsed width
        return isHoverExpanded ? 'lg:pl-72' : 'lg:pl-16' // 64px when collapsed, 288px when hovered
      case 'floating':
        return 'lg:pl-0'
      case 'overlay':
        return 'lg:pl-0'
      default:
        return 'lg:pl-72'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileSidebar}
          className="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200/60 hover:scale-105 active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleMobileSidebar}
        />
      )}

      <div className={`transition-all duration-300 ease-in-out ${getMainContentClasses()}`}>
        {/* Sidebar Toggle Controls - Similar to AdminHeader */}
       

        <AdminHeader />
        <main className="transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  )
}
