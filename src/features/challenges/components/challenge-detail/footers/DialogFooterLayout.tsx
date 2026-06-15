import React from 'react'

export interface DialogFooterLayoutProps {
  children: React.ReactNode
  className?: string
}

export const DialogFooterLayout: React.FC<DialogFooterLayoutProps> = ({ children, className }) => (
  <div
    className={`p-4 md:p-6 pt-3 border-t border-amber-900/50/50 shrink-0 min-h-[76px] flex items-center ${className ?? ''}`}
  >
    <div className="w-full">{children}</div>
  </div>
)

