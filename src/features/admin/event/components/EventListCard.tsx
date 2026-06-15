import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { EmptyState } from '@/shared/components'
import type { Event } from '../types'

interface EventListCardProps {
  events: Event[]
  onAdd: () => void
  onEdit: (evt: Event) => void
  onDelete: (evt: Event) => void
}

const EventListCard: React.FC<EventListCardProps> = ({ events, onAdd, onEdit, onDelete }) => {
  return (
    <Card className="bg-[#fdf6e3] dark:bg-[#1A100C] border border-amber-900/50 dark:border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-amber-900 dark:text-amber-50">Event List</CardTitle>
        <Button onClick={onAdd} className="bg-primary-600 text-white hover:bg-primary-700">
          + Add Event
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-full h-full" />}
            title="No events yet"
            description="Create your first event to get started."
            containerHeight="py-10"
          />
        ) : (
          <motion.div
            className="divide-y border border-amber-900/50 dark:border-gray-700 rounded-md overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {events.map((evt) => (
              <div key={evt.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#fdf6e3] dark:bg-[#2c1e16]/40">
                <div className="min-w-0">
                  <div className="font-medium text-amber-900 dark:text-amber-50 truncate">{evt.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{evt.description || 'No description'}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {evt.start_time ? `Start: ${new Date(evt.start_time).toLocaleString()}` : 'Start: -'}
                    <span className="mx-2">â€¢</span>
                    {evt.end_time ? `End: ${new Date(evt.end_time).toLocaleString()}` : 'End: -'}
                    {evt.always_show_challenges && (
                      <>
                        <span className="mx-2">â€¢</span>
                        Always show challenges
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(evt)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(evt)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default EventListCard


