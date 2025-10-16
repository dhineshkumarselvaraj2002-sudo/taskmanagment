'use client'

  import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

interface ToggleTabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
  tabClassName?: string
  contentClassName?: string
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

export default function ToggleTabs({
  tabs,
  defaultTab,
  className,
  tabClassName,
  contentClassName,
  variant = 'default',
  size = 'md'
}: ToggleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const variantClasses = {
    default: {
      tab: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900',
      activeTab: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700',
      container: 'bg-gray-100 p-1 rounded-lg'
    },
    pills: {
      tab: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      activeTab: 'bg-indigo-600 text-white hover:bg-indigo-700',
      container: 'bg-white border border-gray-200 rounded-lg p-1'
    },
    underline: {
      tab: 'bg-transparent text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300',
      activeTab: 'text-indigo-600 border-indigo-600',
      container: 'border-b border-gray-200'
    }
  }

  const currentVariant = variantClasses[variant]

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Navigation */}
      <div className={cn(
        'flex',
        variant === 'underline' ? 'space-x-8' : 'space-x-1',
        currentVariant.container
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-md',
              sizeClasses[size],
              activeTab === tab.id ? currentVariant.activeTab : currentVariant.tab,
              tabClassName
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={cn('mt-6', contentClassName)}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

// Preset configurations for common use cases
export const CalendarToggleTabs = ({ tabs, defaultTab, className }: Omit<ToggleTabsProps, 'variant' | 'size'>) => (
  <ToggleTabs
    tabs={tabs}
    defaultTab={defaultTab}
    variant="pills"
    size="md"
    className={className}
    tabClassName="min-w-[120px]"
  />
)

export const ProfileToggleTabs = ({ tabs, defaultTab, className }: Omit<ToggleTabsProps, 'variant' | 'size'>) => (
  <ToggleTabs
    tabs={tabs}
    defaultTab={defaultTab}
    variant="underline"
    size="lg"
    className={className}
    tabClassName="min-w-[140px]"
  />
)