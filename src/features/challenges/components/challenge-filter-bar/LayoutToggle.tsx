'use client'

import { LayoutGrid, List } from 'lucide-react'
import { useFilterContext } from '@/shared/contexts'

export default function LayoutToggle() {
  const { layoutMode, setLayoutMode } = useFilterContext()
  const isDefaultLayout = layoutMode === 'grouped'

  return (
    <button
      type="button"
      data-tour="challenge-layout-toggle"
      onClick={() => setLayoutMode(layoutMode === 'compact' ? 'grouped' : 'compact')}
      title={layoutMode === 'compact' ? 'Switch to grouped view' : 'Switch to compact view'}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded transition ${
        isDefaultLayout
          ? 'border-gray-200 dark:border-gray-700 bg-[#fdf6e3] dark:bg-[#2c1e16] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          : 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-950/60'
      }`}
    >
      {layoutMode === 'compact' ? <LayoutGrid size={16} /> : <List size={16} />}
    </button>
  )
}

