'use client'

import { Flag, Zap } from 'lucide-react'
import type { ChallengesMainTab } from '../../types'

type ChallengePageTabsProps = {
  currentTab: ChallengesMainTab
  onTabChange: (tab: ChallengesMainTab) => void
}

export default function ChallengePageTabs({
  currentTab,
  onTabChange,
}: ChallengePageTabsProps) {
  return (
    <div className="flex p-1.5 gap-1 bg-[#fdf6e3]/40 dark:bg-[#1f140f]/40 border border-amber-900/50 backdrop-blur-sm rounded-sm border-double border-4 border-amber-900/70 w-fit">
      <button
        onClick={() => onTabChange('challenges')}
        className={`px-5 py-2 text-sm font-bold transition-all rounded-sm flex items-center gap-2 ${currentTab === 'challenges'
          ? 'bg-[#fdf6e3] dark:bg-[#1A100C] text-amber-700 dark:text-amber-500 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-[#fdf6e3]/50 dark:hover:bg-gray-800/50'
          }`}
      >
        <Flag size={14} className={currentTab === 'challenges' ? 'animate-pulse' : ''} />
        Challenges
      </button>
      <button
        onClick={() => onTabChange('events')}
        className={`px-5 py-2 text-sm font-bold transition-all rounded-sm flex items-center gap-2 ${currentTab === 'events'
          ? 'bg-[#fdf6e3] dark:bg-[#1A100C] text-amber-700 dark:text-amber-500 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-[#fdf6e3]/50 dark:hover:bg-gray-800/50'
          }`}
      >
        <Zap size={14} className={currentTab === 'events' ? 'animate-pulse' : ''} />
        Events
      </button>
    </div>
  )
}


