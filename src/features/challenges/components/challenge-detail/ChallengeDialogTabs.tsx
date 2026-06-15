'use client'

import type { ChallengeDialogTab } from '../../types'

type ChallengeDialogTabsProps = {
  challengeId: string
  tabs: Array<{ key: ChallengeDialogTab; label: string }>
  activeTab: ChallengeDialogTab
  onTabChange: (tab: ChallengeDialogTab, challengeId?: string) => void
}

export default function ChallengeDialogTabs({
  challengeId,
  tabs,
  activeTab,
  onTabChange,
}: ChallengeDialogTabsProps) {
  return (
    <div className="flex p-1 gap-1 bg-black/5 dark:bg-[#fdf6e3]/5 border border-amber-900/50 rounded-sm border-double border-4 border-amber-900/70">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`flex-1 px-3 py-1.5 rounded-sm font-bold text-xs text-center transition-all ${activeTab === tab.key
            ? 'bg-[#fdf6e3] dark:bg-[#1A100C] text-amber-700 dark:text-amber-500 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          onClick={() => onTabChange(tab.key, challengeId)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}


