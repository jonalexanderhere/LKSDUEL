'use client'

import { useEffect, useRef, useState } from 'react'
import { Coins, Droplet, User, Rocket } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader, EmptyState } from '@/shared/components'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { EventSelect } from '@/shared/components/custom'
import { subscribeToSolves } from '@/shared/lib'
import { useScoreboardPageData } from '../hooks'
import ScoreboardChart from './ScoreboardChart'
import ScoreboardTable from './ScoreboardTable'

export default function ScoreboardPage() {
  const [firstBloodAlert, setFirstBloodAlert] = useState<{ username: string; teamName?: string; challenge: string } | null>(null)
  const firstBloodAlertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    user,
    authLoading,
    leaderboard,
    loading,
    firstBloodMode,
    setFirstBloodMode,
    startedEvents,
    selectedEvent,
    setSelectedEvent,
    hasMounted,
    stableLeaderboard,
    isEmpty,
    isDark,
    eventParam,
  } = useScoreboardPageData()

  useEffect(() => {
    if (!user || !firstBloodMode) return

    const unsubscribe = subscribeToSolves(({ username, teamName, challenge, isFirstBlood }) => {
      if (!isFirstBlood) return

      setFirstBloodAlert({ username, teamName, challenge })

      try {
        const audio = new Audio('/sounds/first-blood.mp3')
        audio.volume = 0.65
        audio.play()
      } catch { }

      if (firstBloodAlertTimeout.current) clearTimeout(firstBloodAlertTimeout.current)
      firstBloodAlertTimeout.current = setTimeout(() => setFirstBloodAlert(null), 9000)
    })

    return () => {
      unsubscribe()
      if (firstBloodAlertTimeout.current) clearTimeout(firstBloodAlertTimeout.current)
    }
  }, [firstBloodMode, user])

  if (authLoading) return <Loader fullscreen color="text-blue-500" />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* <TitlePage icon={<Trophy size={30} className="text-yellow-500 dark:text-yellow-300 drop-shadow" />}>Scoreboard</TitlePage> */}

        <div className="mb-4 flex justify-between items-center">
          <div className="relative">
            {/* Event selector */}
            <div className="inline-block">
              <EventSelect
                value={selectedEvent}
                onChange={setSelectedEvent}
                events={startedEvents}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                getEventLabel={(event: any) => String(event?.name ?? event?.title ?? 'Untitled')}
              />
            </div>
          </div>

          <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFirstBloodMode(false)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${!firstBloodMode
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Points"
              >
                <Coins size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  Points
                </span>
              </span>
            </button>
            <button
              onClick={() => setFirstBloodMode(true)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${firstBloodMode
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Points"
              >
                <Droplet size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  First Blood
                </span>
              </span>
            </button>
          </span>
        </div>

        <AnimatePresence>
          {firstBloodMode && firstBloodAlert && (
            <motion.div
              key={`${firstBloodAlert.username}-${firstBloodAlert.challenge}`}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl border border-red-400/60 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-6 py-5 text-white shadow-[0_15px_40px_rgba(220,38,38,0.45)]"
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="pointer-events-none absolute left-12 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-yellow-300/70 blur-sm"
              />
              <motion.div
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(252,211,77,0.45),transparent_45%),radial-gradient(circle_at_70%_40%,rgba(248,113,113,0.35),transparent_55%)]"
              />
              <div className="relative flex items-center gap-3">
                <span className="inline-flex items-center rounded-md bg-black/25 px-2 py-1 text-[10px] font-black tracking-wide">FIRST BLOOD</span>
                <p className="text-sm md:text-base font-semibold">
                  <span className="text-yellow-200">{firstBloodAlert.username}</span>
                  {firstBloodAlert.teamName && firstBloodAlert.teamName !== '-' ? (
                    <span className="ml-2 rounded bg-black/25 px-2 py-0.5 text-xs text-amber-100">
                      {firstBloodAlert.teamName}
                    </span>
                  ) : null}
                  {' '}menjadi yang pertama menyelesaikan{' '}
                  <span className="underline decoration-yellow-200/70">{firstBloodAlert.challenge}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && leaderboard.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader color="text-blue-500" />
          </div>
        ) : !user ? null : (
          <div className={`space-y-8 ${hasMounted ? '' : 'opacity-0'} transition-opacity duration-500`}>
            {stableLeaderboard.length > 0 && !isEmpty && (
              <div>
                <ScoreboardChart leaderboard={stableLeaderboard.length > 0 ? stableLeaderboard : leaderboard} isDark={isDark} />
              </div>
            )}
            <div>
              {isEmpty ? (
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Ranking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmptyState
                      icon={<User className="w-full h-full" />}
                      title="No challenges solved yet."
                      description={
                        <>
                          Leaderboard is empty!<br />
                          Be the first to solve a challenge <Rocket size={16} className="inline-block ml-1 text-blue-500" />
                        </>
                      }
                      containerHeight="py-12"
                    />
                  </CardContent>
                </Card>
              ) : (
                <ScoreboardTable
                  leaderboard={leaderboard}
                  currentUsername={user?.username}
                  eventId={eventParam}
                  scoreColumnLabel={firstBloodMode ? 'First Blood' : undefined}
                  scoreColumnRenderer={(entry) => entry.score}
                  showAllLink={!firstBloodMode}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
