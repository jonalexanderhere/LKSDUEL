"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

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
        const audio = new Audio('/sounds/first-blood.mp3')
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
          <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <p className="font-medium text-gray-700 dark:text-gray-200">No logs found</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">You are all caught up!</p>
      </motion.div>
    );

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {featuredFirstBlood && energyPhase && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className="pointer-events-none relative overflow-hidden rounded-xl border border-red-700/50 bg-black px-5 py-12"
          >
            {/* Deep dark pulsing background */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_80%)] from-red-900/40"
            />
            
            <div className="absolute inset-0 overflow-hidden">
              {/* Intense Blood Dripping */}
              {[...Array(24)].map((_, i) => (
                <motion.span
                  key={`blood-drip-${i}`}
                  initial={{ y: -50, opacity: 0, scaleY: 0.5 }}
                  animate={{ 
                    y: [ -50, 10 + (i % 6) * 15, 150 ], 
                    opacity: [0, 1, 0.8, 0], 
                    scaleY: [0.5, 1.5, 2, 1] 
                  }}
                  transition={{ 
                    duration: 1.2 + (i % 3) * 0.2, 
                    ease: 'easeIn', 
                    delay: i * 0.03 
                  }}
                  className="absolute top-0 rounded-b-full bg-gradient-to-b from-red-800 to-red-600 shadow-[0_5px_15px_rgba(220,38,38,0.8)]"
                  style={{ 
                    left: `${2 + i * 4.2}%`, 
                    width: `${2 + (i % 4)}px`,
                    height: `${30 + (i % 7) * 15}px` 
                  }}
                />
              ))}

              {/* Blood Splatters Exploding */}
              {[...Array(20)].map((_, i) => {
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 50 + (i % 5) * 25;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                return (
                  <motion.div
                    key={`splatter-${i}`}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ 
                      x: tx, 
                      y: ty, 
                      scale: [0, 1.5, 2.5], 
                      opacity: [1, 0.8, 0] 
                    }}
                    transition={{ duration: 0.8 + (i%3)*0.1, ease: "easeOut" }}
                    className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 blur-[1px]"
                    style={{
                      boxShadow: '0 0 15px 4px rgba(220,38,38,0.8)'
                    }}
                  />
                )
              })}
            </div>

            {/* Central Blood Pool / Glow */}
            <motion.div
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: [0, 3, 5], opacity: [0.9, 0.5, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 blur-2xl"
            />

            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative text-center"
            >
              <div className="text-red-500/90 text-sm tracking-[0.5em] font-black drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                BLOOD SURGE
              </div>
            </motion.div>
          </motion.div>
        )}

        {featuredFirstBlood && showFeaturedFirstBlood && (
          <motion.div
            initial={{ opacity: 0, y: -22, scale: 0.93, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.99, filter: 'blur(2px)' }}
            transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.8 }}
            className="relative overflow-hidden rounded-xl border-2 border-red-600/60 bg-black px-5 py-8 shadow-[0_0_50px_rgba(220,38,38,0.4)]"
          >
            {/* Dark moving blood mist */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(153,27,27,0.4),transparent_70%)]"
            />
            {/* Blood drips on the edges */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-4 opacity-70">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`edge-drip-${i}`}
                  animate={{ height: ['10px', `${20 + (i%4) * 15}px`, '10px'] }}
                  transition={{ duration: 2 + (i%3) * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1.5 bg-gradient-to-b from-red-800 to-red-600 rounded-b-full blur-[0.5px] shadow-[0_2px_5px_rgba(220,38,38,0.5)]"
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.div 
                animate={{ textShadow: ['0 0 10px #ef4444', '0 0 25px #dc2626', '0 0 10px #ef4444'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[12px] font-black tracking-[0.4em] text-red-500/90"
              >
                FIRST BLOOD ACHIEVED
              </motion.div>
              
              <div className="mt-3 relative text-4xl font-black uppercase tracking-[0.1em] text-red-600">
                <span className="drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">FIRST BLOOD</span>
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0, 1, 0, 0.8, 0], x: [-2, 2, -1, 3, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute left-0 top-0 text-red-400 translate-x-[2px] mix-blend-screen"
                >
                  FIRST BLOOD
                </motion.span>
              </div>
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex flex-col items-center"
              >
                <div className="text-3xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                  {featuredFirstBlood.log_username || 'unknown'}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="h-[1px] w-8 bg-red-500/50"></span>
                  <span className="text-xs uppercase tracking-[0.2em] text-red-400/80">SLAUGHTERED</span>
                  <span className="h-[1px] w-8 bg-red-500/50"></span>
                </div>
                <div className="mt-2 text-2xl font-black text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                  {featuredFirstBlood.log_challenge_title}
                </div>
                <div className="mt-4 px-3 py-1 border border-red-900/50 bg-red-950/30 rounded text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                  {featuredFirstBlood.log_category}
                </div>
              </motion.div>
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
                ? "bg-gradient-to-r from-red-100 via-red-50 to-white border-red-400 dark:from-red-950/80 dark:via-red-900/40 dark:to-black dark:border-red-700/60 hover:bg-red-100/80 dark:hover:bg-red-900/50"
                : "bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${
              notif.log_type === "first_blood" ? "bg-red-100 dark:bg-red-900/40" : "bg-blue-100 dark:bg-blue-900"
            }`}>
              {notif.log_type === "new_challenge" ? (
                <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 19V6" />
                  <path d="M5 12l7-7 7 7" />
                </svg>
              ) : notif.log_type === "first_blood" ? (
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.85)]" />
              ) : (
                <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>

            <div className="flex-1 flex flex-wrap items-center gap-x-2 min-w-0">
              {notif.log_type === "new_challenge" ? (
                <>
                  <span className="font-semibold text-blue-600 dark:text-blue-300">New Challenge:</span>
                  <span className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-block">{notif.log_challenge_title}</span>
                  <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
                </>
              ) : notif.log_type === "first_blood" ? (
                <>
                  <span className="inline-flex items-center rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-black tracking-wider shadow-sm">FIRST BLOOD</span>
                  <motion.span animate={{ opacity: [0.35, 0.9, 0.35] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="inline-flex items-center gap-1 min-w-0">
                    <Link href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"} className="text-blue-600 dark:text-blue-300 font-medium hover:underline">
                      <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate">
                        {notif.log_username && notif.log_username.length > 20 ? `${notif.log_username.slice(0, 20)}...` : notif.log_username}
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
                    <Link href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"} className="text-blue-600 dark:text-blue-300 font-medium hover:underline">
                      <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate">
                        {notif.log_username && notif.log_username.length > 20 ? `${notif.log_username.slice(0, 20)}...` : notif.log_username}
                      </span>
                    </Link>
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">solved</span>
                  <b className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-flex">{notif.log_challenge_title}</b>
                  <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
                </>
              )}
            </div>

            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap sm:ml-2 w-full sm:w-auto text-left sm:text-right">
              {notif.log_created_at ? formatRelativeDate(notif.log_created_at) : ""}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
