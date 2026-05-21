"use client";

// React Imports
import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Logs, Droplets } from "lucide-react";
import { useRouter } from "next/navigation";

// Shared Imports
import { Loader, TitlePage } from '@/shared/components';
import { EventSelect } from '@/shared/components/custom'
import { useLogs, useEventContext, useAuth } from '@/shared/contexts'

// Local Imports
import LogsList from "./LogsList";

export default function LogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { markAllRead, refresh, unreadCount: challengeUnread } = useLogs()
  const [tabType, setTabType] = useState<'challenges' | 'solves' | 'firstblood'>('solves')
  const [entryBlast, setEntryBlast] = useState(false)
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    // when this page loads, refresh unread count only
    if (!authLoading && user) {
      refresh()
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return
    setEntryBlast(true)
    const hideTimer = setTimeout(() => setEntryBlast(false), 1200)
    try {
      const audio = new Audio('/sounds/first-blood.mp3')
      audio.volume = 0.55
      audio.play()
    } catch { }
    return () => clearTimeout(hideTimer)
  }, [authLoading, user])

  // Events are loaded globally via EventProvider

  // Mark challenge logs as read when user selects the Challenges tab
  useEffect(() => {
    if (tabType === 'challenges' && user) {
      const eventParam = selectedEvent === 'main' ? null : selectedEvent === 'all' ? 'all' : selectedEvent
      markAllRead(eventParam as any)
    }
  }, [tabType, user, selectedEvent, markAllRead])

  // if (authLoading) return null
  if (authLoading) return <Loader fullscreen color="text-blue-500" />
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <AnimatePresence>
        {entryBlast && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-[4500]"
          >
            <motion.div
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 bg-white"
            />
            <motion.div
              initial={{ scale: 0.2, opacity: 0.95 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300/90 blur-md"
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 1.05, ease: "easeOut" }}
              className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/60 blur-2xl"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.7 }}
              animate={{ scale: 5.5, opacity: 0 }}
              transition={{ duration: 1.15, ease: "easeOut" }}
              className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-orange-200/70"
            />
            <div className="absolute left-1/2 top-1/3 h-0 w-0">
              {[...Array(16)].map((_, i) => (
                <motion.span
                  key={`entry-spark-${i}`}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i / 16) * Math.PI * 2) * (120 + (i % 4) * 24),
                    y: Math.sin((i / 16) * Math.PI * 2) * (90 + (i % 5) * 20),
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_12px_rgba(253,224,71,0.9)]"
                />
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: [0, 1, 0.85, 0], y: [20, 0, 0, -8], scale: [0.96, 1.02, 1, 1] }}
              transition={{ duration: 1.05, ease: "easeOut" }}
              className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-red-300/60 bg-black/40 px-5 py-2"
            >
              <span className="text-xl md:text-2xl font-black tracking-[0.25em] text-red-100">FIRST BLOOD</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0.65 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(248,113,113,0.45),rgba(0,0,0,0.2)_38%,transparent_70%)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* <TitlePage size="text-2xl" className="mb-6"><Logs className="inline-block mr-2" /> Logs</TitlePage> */}

      <motion.div
        animate={entryBlast ? { x: [0, -6, 6, -4, 4, 0], y: [0, 3, -3, 2, -2, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
      {/* Event selector + Tabs: Challenge Logs / Solve Logs (styled similar to scoreboard) */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <EventSelect
            value={selectedEvent}
            onChange={setSelectedEvent}
            events={startedEvents}
            className="min-w-[180px] mr-3"
            getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
          />
        </div>

        <div>
          <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTabType('challenges')}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${tabType === 'challenges'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span className="inline-flex items-center gap-2 w-full">
                <span
                  className="flex items-center gap-1 max-w-[75px] md:max-w-none overflow-hidden"
                  title="Challenge Logs"
                >
                  <Flag size={16} className="shrink-0" />
                  <span className="truncate whitespace-nowrap block">
                    Challenge Logs
                  </span>
                </span>

                {challengeUnread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold bg-red-600 text-white shrink-0">
                    {challengeUnread > 99 ? '99+' : challengeUnread}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setTabType('solves')}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${tabType === 'solves'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span
                className="flex items-center gap-1 max-w-[75px] md:max-w-none overflow-hidden"
                title="Solve Logs"
              >
                <Logs size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  Solve Logs
                </span>
              </span>
            </button>
            <button
              onClick={() => setTabType('firstblood')}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${tabType === 'firstblood'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span
                className="flex items-center gap-1 max-w-[95px] md:max-w-none overflow-hidden"
                title="First Blood Logs"
              >
                <Droplets size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  First Blood
                </span>
              </span>
            </button>
          </span>
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            // key={selectedEvent + tabType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {(() => {
              const eventParam = selectedEvent === 'main' ? null : selectedEvent === 'all' ? 'all' : selectedEvent
              return <LogsList tabType={tabType} eventId={eventParam as any} />
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
      </motion.div>
    </main>
  );
}
