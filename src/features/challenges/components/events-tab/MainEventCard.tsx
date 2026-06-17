'use client'

import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/shared/ui'
import { Calendar } from 'lucide-react'

type MainEventCardProps = {
  label: string
  imageUrl: string | null
  selected: boolean
  delay: number
  onSelect: () => void
}

export default function MainEventCard({
  label,
  imageUrl,
  selected,
  delay,
  onSelect,
}: MainEventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      key="__main__"
      className="relative group cursor-pointer h-full"
      onClick={onSelect}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.05] rounded-2xl transition-colors duration-300 pointer-events-none" />

      <div className={`relative h-full flex flex-col overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300
        ${selected
          ? 'bg-amber-500/[0.03] border-amber-500/50 shadow-sm'
          : 'bg-white/40 dark:bg-gray-900/40 border-amber-900/50 group-hover:border-amber-500/50 shadow-sm'}
        hover:shadow-md`}
      >
        {/* Image Section */}
        <div className="relative h-40 w-full overflow-hidden border-b border-amber-900/50/50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-black/60 backdrop-blur-md flex items-center justify-center">
              <img src="/lks-980x917.png" alt="LKS Logo" className="w-16 h-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                Live
              </div>
            </div>

            <h4 className="text-sm md:text-base font-bold text-amber-900 dark:text-amber-50 leading-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
              {label}
            </h4>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
            Default challenges from this platform. Always available for practice.
          </p>

          {/* Footer Metadata */}
          <div className="pt-3 border-t border-amber-900/50/50 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                <Calendar size={12} className="text-blue-500/40" />
                <span>Permanent Event</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500 dark:text-amber-400">
                <Clock size={11} />
                <span>Always active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


