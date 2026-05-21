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
            className="pointer-events-none relative overflow-hidden rounded-xl border border-red-800 bg-black px-5 py-16"
          >
            {/* Deep dark pulsing background */}
            <motion.div
              animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_80%)] from-red-950/60"
            />
            
            <div className="absolute inset-0 overflow-hidden">
              {/* Intense Blood Dripping (Trails + Sliding Beads) */}
              {[...Array(20)].map((_, i) => {
                const left = 3 + i * 5.1;
                const delay = i * 0.04 + (i % 3) * 0.08;
                const trailHeight = 35 + (i % 4) * 35;
                return (
                  <div key={`trail-${i}`} className="absolute top-0" style={{ left: `${left}%` }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${trailHeight}px` }}
                      transition={{ duration: 0.8, delay: delay }}
                      className="w-[1.5px] bg-gradient-to-b from-red-955 via-red-900 to-red-800"
                    />
                    <motion.div
                      initial={{ y: 0, opacity: 0 }}
                      animate={{
                        y: [0, trailHeight, trailHeight + 15, trailHeight + 25],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 1.3,
                        delay: delay + 0.5,
                        repeat: Infinity,
                        repeatDelay: 0.6
                      }}
                      className="w-2.5 h-3.5 -ml-1 rounded-full bg-red-700 shadow-[0_0_8px_#dc2626]"
                    />
                  </div>
                )
              })}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-red-500/90 text-sm tracking-[0.5em] font-black drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]"
              >
                BLOOD SURGE
              </motion.div>
            </div>
          </motion.div>
        )}

        {featuredFirstBlood && showFeaturedFirstBlood && (
          <motion.div
            initial={{ opacity: 0, y: -22, scale: 0.93, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.99, filter: 'blur(2px)' }}
            transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.8 }}
            className="relative overflow-hidden rounded-xl border-2 border-red-800 bg-black px-5 py-12 shadow-[0_0_60px_rgba(220,38,38,0.55)]"
          >
            {/* Google Fonts Link & Styles */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&display=swap" />
            <style dangerouslySetInnerHTML={{__html: `
              .font-nosifer {
                font-family: 'Nosifer', sans-serif !important;
              }
              .font-creepster {
                font-family: 'Creepster', cursive !important;
              }
            `}} />

            {/* Dark moving blood mist */}
            <motion.div
              animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(136,19,55,0.45),transparent_75%)]"
            />

            {/* Background Splatters */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <svg viewBox="0 0 200 200" className="absolute left-1/4 top-1/3 -translate-x-1/2 -translate-y-1/2 w-72 h-72 fill-red-800/60 filter blur-[1px]">
                <path d="M 100 100 C 110 80, 130 50, 120 40 C 110 30, 95 60, 90 70 C 80 60, 60 30, 50 40 C 40 50, 70 80, 80 90 C 65 95, 30 90, 25 105 C 20 120, 55 115, 75 110 C 70 125, 40 160, 55 170 C 70 180, 90 140, 95 130 C 110 145, 140 175, 150 160 C 160 145, 125 125, 115 120 C 130 115, 175 125, 180 110 C 185 95, 140 100, 120 100 Z" />
              </svg>
              <svg viewBox="0 0 200 200" className="absolute right-1/4 bottom-1/4 translate-x-1/2 translate-y-1/2 w-64 h-64 fill-red-900/50 filter blur-[1px] rotate-90">
                <path d="M 100 100 C 110 80, 130 50, 120 40 C 110 30, 95 60, 90 70 C 80 60, 60 30, 50 40 C 40 50, 70 80, 80 90 C 65 95, 30 90, 25 105 C 20 120, 55 115, 75 110 C 70 125, 40 160, 55 170 C 70 180, 90 140, 95 130 C 110 145, 140 175, 150 160 C 160 145, 125 125, 115 120 C 130 115, 175 125, 180 110 C 185 95, 140 100, 120 100 Z" />
              </svg>
            </div>
            
            {/* Top Blood Smear/Border Layer 1 (Darker, thicker base) */}
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-16 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] z-20 pointer-events-none" style={{ fill: '#3f0712' }}>
              <path d="M 0 0 L 1000 0 L 1000 35 Q 980 45, 960 25 T 920 20 Q 900 50, 890 65 Q 880 70, 870 50 Q 860 25, 840 20 T 800 15 Q 785 40, 775 55 Q 765 60, 755 45 Q 745 25, 730 20 T 670 15 Q 650 35, 630 25 T 590 15 Q 570 50, 560 68 Q 550 72, 540 50 Q 530 25, 520 20 T 460 15 Q 440 35, 420 25 T 380 15 Q 365 40, 355 55 Q 345 60, 335 45 Q 325 25, 320 20 T 290 15 T 250 15 Q 230 40, 220 55 Q 210 60, 200 40 Q 190 20, 170 15 T 130 15 Q 110 35, 90 25 T 50 15 Q 30 40, 20 50 Q 10 52, 0 30 Z" />
            </svg>

            {/* Top Blood Smear/Border Layer 2 (Brighter red overlay for 3D depth) */}
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-12 fill-red-700/90 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] z-20 pointer-events-none">
              <path d="M 0 0 L 1000 0 L 1000 25 Q 980 32, 960 18 T 920 12 Q 900 35, 890 48 Q 880 52, 870 32 Q 860 18, 840 12 T 800 10 Q 785 28, 775 40 Q 765 42, 755 32 Q 745 18, 730 12 T 670 10 Q 650 20, 630 18 T 590 10 Q 570 35, 560 48 Q 550 52, 540 32 Q 530 18, 520 12 T 460 10 Q 440 20, 420 18 T 380 10 Q 365 28, 355 40 Q 345 42, 335 32 Q 325 18, 320 12 T 290 10 T 250 10 Q 230 28, 220 40 Q 210 42, 200 28 Q 190 12, 170 10 T 130 10 Q 110 22, 90 18 T 50 10 Q 30 28, 20 32 Q 10 35, 0 20 Z" />
            </svg>

            {/* Dynamic Blood Drips - Organic SVG shapes at non-uniform positions */}
            <div className="absolute top-10 left-0 right-0 bottom-0 pointer-events-none overflow-hidden z-20">
              {[
                { left: 9, height: 60, delay: 0.2, pathIdx: 0, width: 'w-7' },
                { left: 18, height: 110, delay: 1.5, pathIdx: 1, width: 'w-8' },
                { left: 27, height: 80, delay: 0.8, pathIdx: 2, width: 'w-6' },
                { left: 41, height: 140, delay: 2.3, pathIdx: 1, width: 'w-9' },
                { left: 49, height: 70, delay: 0.5, pathIdx: 0, width: 'w-7' },
                { left: 58, height: 125, delay: 1.1, pathIdx: 2, width: 'w-8' },
                { left: 71, height: 95, delay: 1.9, pathIdx: 0, width: 'w-7' },
                { left: 81, height: 150, delay: 0.1, pathIdx: 1, width: 'w-9' },
                { left: 88, height: 75, delay: 1.4, pathIdx: 2, width: 'w-6' },
                { left: 94, height: 100, delay: 0.7, pathIdx: 0, width: 'w-7' }
              ].map((drip, i) => {
                const paths = [
                  "M 15 0 C 18 30, 10 50, 10 70 C 5 90, 2 100, 15 110 C 28 100, 25 90, 20 70 C 20 50, 30 30, 25 0 Z",
                  "M 15 0 C 18 40, 8 60, 6 90 C 2 110, 0 120, 16 130 C 32 120, 26 110, 22 90 C 24 60, 20 40, 23 0 Z",
                  "M 18 0 C 20 20, 10 35, 8 50 C 4 60, 2 65, 13 75 C 24 65, 22 60, 18 50 C 20 35, 26 20, 23 0 Z"
                ];
                
                const selectedPath = paths[drip.pathIdx];
                const duration = 4.2 + (i % 3) * 0.9;
                
                return (
                  <div 
                    key={`dynamic-drip-${i}`} 
                    className="absolute top-0" 
                    style={{ left: `${drip.left}%` }}
                  >
                    <motion.svg
                      viewBox="0 0 40 150"
                      className={`${drip.width} origin-top filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]`}
                      style={{ height: `${drip.height}px` }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ 
                        scaleY: [0, 1, 1, 0.85, 0],
                        opacity: [0, 1, 1, 0.7, 0],
                        y: [0, 0, 5, 12, 0]
                      }}
                      transition={{ 
                        duration: duration, 
                        repeat: Infinity, 
                        delay: drip.delay,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.8, 0.92, 1]
                      }}
                    >
                      <defs>
                        <linearGradient id={`bloodDripGrad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#27050c" />
                          <stop offset="35%" stopColor="#6b0722" />
                          <stop offset="75%" stopColor="#be123c" />
                          <stop offset="90%" stopColor="#f43f5e" />
                          <stop offset="100%" stopColor="#4c0519" />
                        </linearGradient>
                      </defs>
                      <path d={selectedPath} fill={`url(#bloodDripGrad-${i})`} />
                      <ellipse cx="14" cy="98" rx="2" ry="5.5" transform="rotate(-15 14 98)" fill="white" opacity="0.5" />
                    </motion.svg>
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.div 
                animate={{ textShadow: ['0 0 10px #f43f5e', '0 0 25px #e11d48', '0 0 10px #f43f5e'] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-[12px] font-black tracking-[0.45em] text-rose-500 font-creepster"
              >
                FIRST BLOOD ACHIEVED
              </motion.div>
              
              <div className="mt-4 mb-2 relative text-4xl font-bold uppercase tracking-wider font-nosifer text-red-600 select-none">
                <span className="drop-shadow-[0_0_20px_rgba(220,38,38,0.95)]">FIRST BLOOD</span>
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0, 1, 0, 0.8, 0], x: [-1.5, 1.5, -1, 2, 0] }}
                  transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 2.5 }}
                  className="absolute left-0 top-0 text-rose-500 translate-x-[1px] translate-y-[1px] mix-blend-screen"
                >
                  FIRST BLOOD
                </motion.span>
              </div>
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex flex-col items-center text-center"
              >
                <div className="text-4xl font-bold text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)] tracking-wide font-creepster">
                  {featuredFirstBlood.log_username || 'unknown'}
                </div>
                <div className="flex items-center gap-3 mt-4 mb-1">
                  <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-red-600"></span>
                  <span className="text-sm font-black uppercase tracking-[0.25em] text-red-500 font-creepster drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">SLAUGHTERED</span>
                  <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-red-600"></span>
                </div>
                <div className="mt-2 text-3xl font-black text-rose-600 font-creepster drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] tracking-wide">
                  {featuredFirstBlood.log_challenge_title}
                </div>
                <div className="mt-5 px-4 py-1.5 border border-red-900/50 bg-red-950/40 rounded-full text-[10px] uppercase tracking-[0.25em] text-zinc-300 font-creepster shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
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
                <svg width="18" height="18" viewBox="0 0 100 100" fill="none" className="filter drop-shadow-[0_2px_4px_rgba(220,38,38,0.5)]">
                  <defs>
                    <radialGradient id={`bloodGlow-${idx}`} cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ff4d4d" />
                      <stop offset="55%" stopColor="#b30000" />
                      <stop offset="100%" stopColor="#4d0000" />
                    </radialGradient>
                  </defs>
                  <path d="M50 12 C 50 12, 18 55, 18 72 A 32 32 0 1 0 82 72 C 82 55, 50 12, 50 12 Z" fill={`url(#bloodGlow-${idx})`} />
                  <ellipse cx="40" cy="62" rx="4" ry="7" transform="rotate(-20 40 62)" fill="white" opacity="0.65" />
                </svg>
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
