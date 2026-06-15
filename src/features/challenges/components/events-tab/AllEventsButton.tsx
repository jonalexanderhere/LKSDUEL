'use client'

import { motion } from 'framer-motion'

type AllEventsButtonProps = {
  selected: boolean
  onSelect: () => void
}

export default function AllEventsButton({
  selected,
  onSelect,
}: AllEventsButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative w-full px-5 py-4 rounded-sm border-double border-4 border-amber-900/70 border backdrop-blur-md transition-all duration-300 text-left group
        ${selected
          ? 'bg-amber-600 dark:bg-amber-700/[0.03] border-blue-500/50 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
          : 'bg-[#fdf6e3]/40 dark:bg-[#1f140f]/40 border-amber-900/50 hover:border-blue-500/50 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'}
      `}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-amber-600 dark:bg-amber-700/0 group-hover:bg-amber-600 dark:bg-amber-700/[0.03] rounded-sm border-double border-4 border-amber-900/70 transition-colors duration-300 pointer-events-none" />

      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex flex-col">
          <h4 className="text-sm md:text-base font-bold text-amber-900 dark:text-amber-50 leading-tight group-hover:text-amber-700 dark:text-amber-500 dark:group-hover:text-blue-400 transition-colors">
            All Events & Challenges
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-medium">
            View unified challenge dashboard
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border-double border-4 border-amber-900/70 bg-amber-600 dark:bg-amber-700/5 dark:bg-blue-400/5 border border-blue-500/10 dark:border-blue-400/10 shrink-0">
          <div className="w-1 h-1 rounded-full bg-amber-600 dark:bg-amber-700 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
          <div className="font-bold text-amber-700 dark:text-amber-500 dark:text-blue-400 uppercase tracking-widest text-[9px]">
            Master View
          </div>
        </div>
      </div>
    </motion.button>
  )
}


