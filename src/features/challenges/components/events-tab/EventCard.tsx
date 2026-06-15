'use client'

import { Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/shared/ui'
import {
  getEventDateLabels,
  getEventStatus,
  getTimeRemaining,
  normalizeEventImageUrl,
} from '../../lib'
import type { EnrichedChallengeEvent } from '../../types'
import EventJoinSection from './EventJoinSection'

type EventCardTone = 'default' | 'ended'

type EventCardProps = {
  event: EnrichedChallengeEvent
  selected: boolean
  fallbackImageUrl: string | null
  now: Date
  delay: number
  tone?: EventCardTone
  onSelect: () => void
}

export default function EventCard({
  event,
  selected,
  fallbackImageUrl,
  now,
  delay,
  tone = 'default',
  onSelect,
}: EventCardProps) {
  const status = getEventStatus(event)
  const timeRemaining = getTimeRemaining(event)
  const eventImageUrl = normalizeEventImageUrl(event.image_url) || fallbackImageUrl
  const { startText, endText, startLabel, endLabel } = getEventDateLabels(event, now)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      key={event.id}
      className="relative group cursor-pointer h-full"
      onClick={onSelect}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-amber-600 dark:bg-amber-700/0 group-hover:bg-amber-600 dark:bg-amber-700/[0.03] rounded-sm border-double border-4 border-amber-900/70 transition-colors duration-300 pointer-events-none" />

      <div className={`relative h-full flex flex-col overflow-hidden rounded-sm border-double border-4 border-amber-900/70 border backdrop-blur-md transition-all duration-300
        ${selected
          ? 'bg-amber-600 dark:bg-amber-700/[0.03] border-blue-500/50 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
          : 'bg-[#fdf6e3]/40 dark:bg-[#1f140f]/40 border-amber-900/50 group-hover:border-blue-500/50 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'}
        ${tone === 'ended' ? 'opacity-70 grayscale-[0.3]' : ''}
        hover:shadow-[0_6px_16px_rgba(0,0,0,0.8)]`}
      >
        {/* Image Section */}
        <div className="relative h-40 w-full overflow-hidden border-b border-amber-900/50/50">
          {eventImageUrl ? (
            <img
              src={eventImageUrl}
              alt={event.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
              <Calendar size={24} className="text-amber-600 dark:text-amber-500/20" />
            </div>
          )}

          <div className="absolute top-3 right-3">
            <EventJoinSection isLocked={event.isLocked} />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${status.color}`}>
                {status.label}
              </div>
            </div>

            <h4 className="text-sm md:text-base font-bold text-amber-900 dark:text-amber-50 leading-tight group-hover:text-amber-700 dark:text-amber-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {event.name}
            </h4>
          </div>

          {event.description && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
              {event.description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="pt-3 border-t border-amber-900/50/50 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                <Calendar size={12} className="text-amber-600 dark:text-amber-500/40" />
                <span>{startText}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-700 dark:text-amber-500 dark:text-blue-400">
                <Clock size={11} />
                <span>{timeRemaining}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


