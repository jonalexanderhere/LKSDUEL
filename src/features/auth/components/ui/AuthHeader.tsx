import React from 'react'

interface AuthHeaderProps {
  badge: string
  title: string
  subtitle?: string
}

export function AuthHeader({ badge, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 shadow-sm shadow-blue-500/5 dark:text-blue-400">
        {badge}
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-amber-900 dark:text-amber-50 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}

