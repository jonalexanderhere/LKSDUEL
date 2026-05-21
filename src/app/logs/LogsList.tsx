"use client";

// React Imports
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Trophy } from "lucide-react";

// Shared Imports
import { Loader } from '@/shared/components';
import { useLogs } from '@/shared/contexts';
import { formatRelativeDate } from '@/shared/lib'

export type LogEntry = {
  log_type: "new_challenge" | "first_blood" | "solve";
  log_challenge_id: string;
  log_challenge_title: string;
  log_category: string;
  log_user_id?: string;
  log_username?: string;
  log_created_at: string;
};

export default function LogsList({ tabType = 'challenges', eventId }: { tabType?: 'challenges' | 'solves' | 'firstblood', eventId?: string | null | 'all' }) {
  const [notifications, setNotifications] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeaturedFirstBlood, setShowFeaturedFirstBlood] = useState(false)
  const [energyPhase, setEnergyPhase] = useState(false)
  const prevTabRef = useRef<'challenges' | 'solves' | 'firstblood' | null>(null)
  const { getFeed } = useLogs()

  const eventKey = eventId === undefined ? 'any' : (eventId === null ? 'main' : String(eventId))
  const cacheKey = `${tabType}:${eventKey}`

  useEffect(() => {
    (async () => {
      setLoading(true);

      const merged = await getFeed(tabType, eventId)
      setNotifications(merged as LogEntry[])
      setLoading(false)
    })();
  }, [cacheKey, eventId, getFeed, tabType]);

  // Filter based on tab type
  const challengeLogs = notifications.filter(n => n.log_type === 'new_challenge');
  const solveLogs = notifications.filter(n => n.log_type === 'solve');
  const firstBloodLogs = notifications.filter(n => n.log_type === 'first_blood');
  const filteredNotifications = tabType === 'solves'
    ? solveLogs
    : tabType === 'firstblood'
      ? firstBloodLogs
      : challengeLogs;
  const featuredFirstBlood = tabType === 'firstblood' && firstBloodLogs.length > 0 ? firstBloodLogs[0] : null;

  useEffect(() => {
    if (tabType !== 'firstblood' || !featuredFirstBlood) {
      setShowFeaturedFirstBlood(false)
      setEnergyPhase(false)
      return
    }
    setEnergyPhase(true)
    const t1 = setTimeout(() => {
      setEnergyPhase(false)
      setShowFeaturedFirstBlood(true)
    }, 1500)
    const t2 = setTimeout(() => setShowFeaturedFirstBlood(false), 6200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [tabType, featuredFirstBlood?.log_created_at, featuredFirstBlood?.log_challenge_id])

  useEffect(() => {
    const enteredFirstBloodTab = prevTabRef.current !== 'firstblood' && tabType === 'firstblood'
    if (enteredFirstBloodTab) {
      try {
        const audio = new Audio('/sounds/soundfirstbloodlogs.mp3')
        audio.volume = 0.7
        void audio.play()
      } catch { }
    }
    prevTabRef.current = tabType
  }, [tabType])

  if (loading && notifications.length === 0) return <Loader fullscreen color="text-blue-500" />;

  if (filteredNotifications.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border rounded-lg px-4 py-6 shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center text-center text-sm text-gray-600 dark:text-gray-300"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mb-3">
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <p className="font-medium text-gray-700 dark:text-gray-200">No logs found</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">You’re all caught up!</p>
      </motion.div>
    );

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {featuredFirstBlood && energyPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none relative overflow-hidden rounded-xl border border-red-600/70 bg-black/70 px-5 py-8"
          >
            <motion.div 
              animate={{ rotate: 180 }} 
              transition={{ duration: 1.5, ease: "easeIn" }}
              className="absolute inset-0"
            >
              {[...Array(60)].map((_, i) => {
                const angle = (i / 60) * Math.PI * 2 + (i % 5) * 0.2
                const radius = 220 + (i % 8) * 20
                const fromX = Math.cos(angle) * radius
                const fromY = Math.sin(angle) * radius
                const colors = ['bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-rose-500', 'bg-white']
                const color = colors[i % colors.length]
                const size = 1.5 + (i % 4) * 0.5
                return (
                  <motion.span
                    key={`energy-particle-${i}`}
                    initial={{ x: fromX, y: fromY, opacity: 0, scale: 0.5 }}
                    animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.5, 1.5, 0.2] }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeIn',
                      delay: (i % 12) * 0.05,
                    }}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${color} shadow-[0_0_15px_rgba(220,38,38,1)]`}
                    style={{ width: size + 'px', height: size + 'px' }}
                  />
                )
              })}
            </motion.div>
            <motion.div
              initial={{ scale: 2.5, opacity: 0 }}
              animate={{ scale: 0.5, opacity: 1 }}
              transition={{ duration: 1.35, ease: 'easeIn' }}
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/50 blur-3xl"
            />
            <motion.div
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 0.2, opacity: 1 }}
              transition={{ duration: 1.35, ease: 'easeIn' }}
              className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-400/80"
            />
          </motion.div>
        )}
        {featuredFirstBlood && showFeaturedFirstBlood && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.5, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              y: [0, -15, 12, -8, 5, -2, 0], 
              x: [0, 10, -8, 6, -4, 2, 0],
              scale: [1, 1.1, 0.95, 1.05, 0.98, 1], 
              filter: 'blur(0px)' 
            }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
            transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.8 }}
            className="relative overflow-hidden rounded-2xl border border-red-500/80 bg-[#0a0000] px-6 py-10 shadow-[0_0_50px_rgba(220,38,38,0.3)] group"
          >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.15)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-40" />
            
            {/* Pulsing Core Glow */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/30 blur-[60px] pointer-events-none"
            />

            {/* Floating embers */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(24)].map((_, i) => {
                const duration = 2 + (i % 5) * 0.6;
                const delay = (i % 10) * 0.3;
                const xOffset = ((i * 17) % 60) - 30;
                const size = 1.5 + (i % 3);
                return (
                  <motion.div
                    key={`ember-${i}`}
                    animate={{
                      y: ['100%', '-20%'],
                      x: [0, xOffset, -xOffset, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                    }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      delay: delay,
                      ease: 'linear'
                    }}
                    className="absolute bottom-0 rounded-full bg-red-500 blur-[0.5px]"
                    style={{ left: `${(i / 24) * 100}%`, width: size, height: size }}
                  />
                );
              })}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ type: 'spring', delay: 0.1, duration: 1 }}
                className="mb-5 rounded-full bg-red-950/90 p-5 border border-red-500/60 shadow-[0_0_30px_rgba(220,38,38,0.6)]"
              >
                <Trophy size={42} className="text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,1)]" />
              </motion.div>

              <div className="relative text-center">
                <motion.h2 
                  animate={{ textShadow: ['0 0 15px rgba(248,113,113,0.5)', '0 0 30px rgba(239,68,68,0.8)', '0 0 15px rgba(248,113,113,0.5)'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl sm:text-5xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-600 mb-1"
                >
                  FIRST BLOOD
                </motion.h2>
                
                <div className="flex items-center justify-center gap-4 mt-8 mb-4">
                  <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-red-600 rounded-full" />
                  <span className="text-red-400 text-xs font-bold tracking-[0.4em] uppercase drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]">Achieved By</span>
                  <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-red-600 rounded-full" />
                </div>
                
                <p className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                  {featuredFirstBlood.log_username || 'unknown'}
                </p>
                
                <div className="mt-8 flex flex-col items-center justify-center gap-1.5 bg-red-950/50 py-3.5 px-10 rounded-xl border border-red-800/60 backdrop-blur-md shadow-inner">
                  <span className="text-[10px] font-bold text-red-300/90 uppercase tracking-[0.3em]">Challenge Solved</span>
                  <p className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                    {featuredFirstBlood.log_challenge_title} <span className="text-red-500 font-black ml-1">[{featuredFirstBlood.log_category}]</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.ul
        key={cacheKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: loading ? 0.6 : 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-2"
      >
      {filteredNotifications.map((notif, idx) => (
        <motion.li
          key={idx}
          className={`border rounded-lg px-4 py-3 shadow flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm transition-colors duration-150 min-w-0 ${
            notif.log_type === "first_blood"
              ? "bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border-red-300 dark:from-red-950/50 dark:via-rose-950/40 dark:to-amber-950/30 dark:border-red-800/60 hover:bg-red-50/80"
              : "bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
          }`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Icon */}
          <span className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${
            notif.log_type === "first_blood" ? "bg-red-100 dark:bg-red-900/40" : "bg-blue-100 dark:bg-blue-900"
          }`}>
            {notif.log_type === "new_challenge" ? (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 19V6" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            ) : notif.log_type === "first_blood" ? (
              <Trophy size={18} className="text-amber-500" />
            ) : (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>

          {/* Content */}
          <div className="flex-1 flex flex-wrap items-center gap-x-2 min-w-0">
            {notif.log_type === "new_challenge" ? (
              <>
                <span className="font-semibold text-blue-600 dark:text-blue-300">New Challenge:</span>
                <span className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-block">{notif.log_challenge_title}</span>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            ) : notif.log_type === "first_blood" ? (
              <>
                <span className="inline-flex items-center rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-black tracking-wider shadow-sm">
                  FIRST BLOOD
                </span>
                <motion.span
                  animate={{ opacity: [0.35, 0.9, 0.35] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="inline-block h-2 w-2 rounded-full bg-yellow-400"
                />
                <span className="inline-flex items-center gap-1 min-w-0">
                  <Link
                    href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"}
                    className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                  >
                    <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate">
                      {notif.log_username && notif.log_username.length > 20
                        ? `${notif.log_username.slice(0, 20)}...`
                        : notif.log_username}
                    </span>
                  </Link>
                </span>
                <span className="text-red-700 dark:text-red-200 font-semibold">solved</span>
                <b className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-block">{notif.log_challenge_title}</b>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate min-w-0">
                  <Link
                    href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"}
                    className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                  >
                    <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate">
                      {notif.log_username && notif.log_username.length > 20
                        ? `${notif.log_username.slice(0, 20)}...`
                        : notif.log_username}
                    </span>
                  </Link>
                </span>
                <span className="text-gray-700 dark:text-gray-300">solved</span>
                <b className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-flex">{notif.log_challenge_title}</b>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            )}
          </div>

          {/* Date */}
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap sm:ml-2 w-full sm:w-auto text-left sm:text-right">
            {notif.log_created_at ? formatRelativeDate(notif.log_created_at) : ""}
          </span>
        </motion.li>
      ))}
      </motion.ul>
    </div>
  );
}
