import React from 'react'
import { DialogFooterLayout } from './DialogFooterLayout'

export interface SolversFooterProps {
  solvesSortOrder: 'newest' | 'oldest'
  setSolvesSortOrder: (order: 'newest' | 'oldest') => void
}

export const SolversFooter: React.FC<SolversFooterProps> = ({
  solvesSortOrder,
  setSolvesSortOrder,
}) => {
  return (
    <DialogFooterLayout className="bg-[#f4e4bc]/50 dark:bg-[#1f140f]/50">
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center h-[38px] text-[11px] uppercase font-black text-gray-500 dark:text-gray-500 tracking-[0.2em] bg-gray-200/50 dark:bg-[#1A100C]/50 px-4 rounded-sm border-double border-4 border-amber-900/70 border border-amber-900/50 sm:flex">
          Order by solve time
        </div>
        <div className="flex items-center h-[38px] text-[11px] uppercase font-black text-gray-500 dark:text-gray-500 tracking-[0.2em] sm:hidden">
          Sort
        </div>
        <div className="flex bg-gray-200/80 dark:bg-[#1A100C] p-1 rounded-sm border-double border-4 border-amber-900/70 border border-gray-300 dark:border-gray-700/50 shadow-[0_4px_12px_rgba(0,0,0,0.6)] h-[38px]">
          <button
            onClick={() => setSolvesSortOrder('oldest')}
            className={`flex items-center justify-center px-4 h-full text-[11px] font-black uppercase tracking-wider rounded-sm transition-all active:scale-95 ${
              solvesSortOrder === 'oldest'
                ? 'bg-[#fdf6e3] dark:bg-gray-700 text-amber-700 dark:text-amber-500 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Oldest
          </button>
          <button
            onClick={() => setSolvesSortOrder('newest')}
            className={`flex items-center justify-center px-4 h-full text-[11px] font-black uppercase tracking-wider rounded-sm transition-all active:scale-95 ${
              solvesSortOrder === 'newest'
                ? 'bg-[#fdf6e3] dark:bg-gray-700 text-amber-700 dark:text-amber-500 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Newest
          </button>
        </div>
      </div>
    </DialogFooterLayout>
  )
}


