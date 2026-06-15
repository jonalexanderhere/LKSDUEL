import React from 'react'
import type { LucideIcon } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'
import { cn } from '@/shared/lib/utils'

type UserEmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function UserEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: UserEmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-sm border-double border-4 border-amber-900/70 border border-amber-900/50 bg-[#fdf6e3]/40 backdrop-blur-sm dark:border-white/10 dark:bg-[#1f140f]/40',
        className
      )}
    >
      <EmptyState
        icon={<Icon className="h-full w-full text-amber-600 dark:text-amber-500 dark:text-blue-400" />}
        title={title}
        description={description}
        action={action}
        containerHeight="py-12"
        className="[&_div:first-child]:bg-amber-600 dark:bg-amber-700/10 [&_div:first-child]:text-amber-600 dark:text-amber-500 [&_div:first-child]:ring-1 [&_div:first-child]:ring-blue-500/20"
      />
    </div>
  )
}

