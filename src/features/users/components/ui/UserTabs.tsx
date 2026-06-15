import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type UserTab<T extends string> = {
  value: T
  label: string
  icon: LucideIcon
}

type UserTabsProps<T extends string> = {
  tabs: UserTab<T>[]
  activeTab: T
  onChange: (tab: T) => void
  className?: string
}

export function UserTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: UserTabsProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-amber-900/50 bg-[#fdf6e3]/50 p-1 backdrop-blur dark:border-white/10 dark:bg-[#1A100C]/50',
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = activeTab === tab.value

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
              active
                ? 'bg-amber-600 dark:bg-amber-700/20 text-amber-700 dark:text-amber-500 shadow-[0_0_18px_rgba(59,130,246,0.12)] dark:text-blue-400'
                : 'text-gray-500 hover:text-amber-700 dark:text-amber-500 dark:text-gray-400 dark:hover:text-blue-400'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

