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
                const duration = 1.3 + (i % 4) * 0.25;
                const trailHeight = 50 + (i % 5) * 25;
                return (
                  <div key={`drip-container-${i}`} className="absolute top-0" style={{ left: `${left}%` }}>
                    {/* Falling trail */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: trailHeight, opacity: [0, 0.8, 0.8, 0] }}
                      transition={{ duration: duration, delay: delay, ease: 'easeOut' }}
                      className="w-[1.5px] bg-red-950"
                    />
                    {/* The sliding bead */}
                    <motion.div
                      initial={{ y: 0, scaleY: 1, scaleX: 1, opacity: 0 }}
                      animate={{ 
                        y: [0, trailHeight], 
                        scaleY: [1.6, 1.1, 2.2, 1], 
                        scaleX: [0.9, 1.2, 0.8, 1],
                        opacity: [0, 1, 1, 0] 
                      }}
                      transition={{ duration: duration, delay: delay, ease: 'easeIn' }}
                      className="w-2.5 h-3.5 rounded-full rounded-t-sm bg-gradient-to-b from-red-900 via-red-600 to-red-950 -ml-[4px] relative"
                      style={{
                        boxShadow: '0 3px 8px rgba(153,27,27,0.8)',
                      }}
                    >
                      {/* 3D Liquid Shine */}
                      <div className="absolute top-0.5 left-0.5 w-[2px] h-[3px] bg-white/40 rounded-full" />
                    </motion.div>
                  </div>
                );
              })}

              {/* Organic Exploding Blood Splatters */}
              {[...Array(24)].map((_, i) => {
                const angle = (Math.PI * 2 * i) / 24 + (i % 3) * 0.08;
                const velocity = 45 + (i % 6) * 22;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                const borderRadii = [
                  'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
                  'rounded-[30%_70%_70%_30%_/_50%_30%_70%_50%]',
                  'rounded-[60%_40%_30%_70%_/_40%_50%_50%_60%]',
                  'rounded-[50%_50%_60%_40%_/_60%_40%_60%_40%]',
                ];
                const borderRadius = borderRadii[i % borderRadii.length];
                const rotation = i * 15;
                const scale = 0.6 + (i % 4) * 0.35;
                const duration = 0.7 + (i % 3) * 0.15;
                return (
                  <motion.div
                    key={`splatter-${i}`}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: rotation }}
                    animate={{ 
                      x: tx, 
                      y: ty, 
                      scale: [0, scale * 1.6, scale], 
                      opacity: [1, 0.9, 0],
                      rotate: rotation + (i % 2 === 0 ? 120 : -120)
                    }}
                    transition={{ duration: duration, ease: "easeOut" }}
                    className={`absolute left-1/2 top-1/2 bg-gradient-to-br from-red-600 via-red-800 to-red-950 ${borderRadius}`}
                    style={{
                      width: `${5 + (i % 3) * 2}px`,
                      height: `${7 + (i % 4) * 2}px`,
                      boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.8), 0 3px 10px rgba(153,27,27,0.8)',
                    }}
                  >
                    {/* Shiny Highlight */}
                    <div className="absolute top-0.5 left-0.5 w-[30%] h-[30%] bg-white/40 rounded-full" />
                  </motion.div>
                )
              })}
            </div>

            {/* Central Blood Pool / Glow */}
            <motion.div
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: [0, 2.5, 4.5], opacity: [0.9, 0.4, 0] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-600 to-red-800 blur-2xl"
            />

            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative text-center"
            >
              <div className="text-red-500/90 text-sm tracking-[0.5em] font-black drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]">
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
            className="relative overflow-hidden rounded-xl border-2 border-red-700 bg-black px-5 py-10 shadow-[0_0_60px_rgba(220,38,38,0.55)]"
          >
            {/* Dark moving blood mist */}
            <motion.div
              animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(136,19,55,0.45),transparent_75%)]"
            />
            
            {/* Top Blood Smear/Border Layer 1 (Darker, thicker base) */}
            <svg viewBox="0 0 1000 45" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-12 fill-rose-955 filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] z-20 pointer-events-none" style={{ fill: '#4c0519' }}>
              <path d="M 0 0 L 1000 0 L 1000 20 Q 980 25, 960 15 T 920 12 Q 900 30, 890 40 Q 880 45, 870 30 Q 860 15, 840 12 T 800 10 Q 785 25, 775 35 Q 765 40, 755 30 Q 745 15, 730 12 T 670 10 Q 650 20, 630 15 T 590 10 Q 570 30, 560 42 Q 550 45, 540 30 Q 530 15, 520 12 T 460 10 Q 440 20, 420 15 T 380 10 Q 365 25, 355 35 Q 345 40, 335 30 Q 325 15, 320 12 T 290 10 T 250 10 Q 230 25, 220 35 Q 210 40, 200 25 Q 190 12, 170 10 T 130 10 Q 110 20, 90 15 T 50 10 Q 30 25, 20 30 Q 10 32, 0 18 Z" />
            </svg>

            {/* Top Blood Smear/Border Layer 2 (Brighter red overlay for 3D depth) */}
            <svg viewBox="0 0 1000 45" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-9 fill-red-700/90 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] z-20 pointer-events-none">
              <path d="M 0 0 L 1000 0 L 1000 14 Q 980 18, 960 10 T 920 8 Q 900 20, 890 28 Q 880 32, 870 20 Q 860 10, 840 8 T 800 6 Q 785 18, 775 25 Q 765 28, 755 20 Q 745 10, 730 8 T 670 6 Q 650 12, 630 10 T 590 6 Q 570 20, 560 28 Q 550 32, 540 20 Q 530 10, 520 8 T 460 6 Q 440 12, 420 10 T 380 6 Q 365 18, 355 25 Q 345 28, 335 20 Q 325 10, 320 8 T 290 6 T 250 6 Q 230 18, 220 25 Q 210 28, 200 18 Q 190 8, 170 6 T 130 6 Q 110 12, 90 10 T 50 6 Q 30 18, 20 20 Q 10 22, 0 12 Z" />
            </svg>

            {/* Dynamic Blood Drips - Organic SVG shapes at non-uniform positions */}
            <div className="absolute top-6 left-0 right-0 bottom-0 pointer-events-none overflow-hidden z-20">
              {[
                { left: 7, height: 45, delay: 0.2, pathIdx: 0 },
                { left: 14, height: 85, delay: 1.5, pathIdx: 1 },
                { left: 22, height: 60, delay: 0.8, pathIdx: 2 },
                { left: 38, height: 110, delay: 2.3, pathIdx: 1 },
                { left: 47, height: 50, delay: 0.5, pathIdx: 0 },
                { left: 56, height: 95, delay: 1.1, pathIdx: 2 },
                { left: 69, height: 70, delay: 1.9, pathIdx: 0 },
                { left: 78, height: 120, delay: 0.1, pathIdx: 1 },
                { left: 85, height: 55, delay: 1.4, pathIdx: 2 },
                { left: 93, height: 80, delay: 0.7, pathIdx: 0 }
              ].map((drip, i) => {
                const paths = [
                  "M 10 0 Q 12 20, 8 40 Q 6 60, 10 80 C 10 87, 4 95, 10 100 C 16 95, 10 87, 10 80 Q 14 60, 12 40 Q 16 20, 10 0 Z",
                  "M 10 0 Q 6 25, 14 50 Q 18 75, 10 100 C 5 108, 15 120, 10 120 C 5 120, 15 108, 10 100 Q 18 75, 14 50 Q 6 25, 10 0 Z",
                  "M 12 0 C 15 20, 9 35, 7 50 Q 5 70, 9 90 C 9 97, 5 102, 9 105 C 13 102, 9 97, 11 90 Q 13 70, 11 50 C 9 35, 15 20, 12 0 Z"
                ];
                
                const selectedPath = paths[drip.pathIdx];
                const duration = 3.8 + (i % 3) * 0.7;
                
                return (
                  <div 
                    key={`dynamic-drip-${i}`} 
                    className="absolute top-0" 
                    style={{ left: `${drip.left}%` }}
                  >
                    <motion.svg
                      viewBox="0 0 20 120"
                      className="w-3.5 origin-top filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)]"
                      style={{ height: `${drip.height}px` }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ 
                        scaleY: [0, 1, 1, 0.85, 0],
                        opacity: [0, 1, 1, 0.7, 0],
                        y: [0, 0, 4, 10, 0]
                      }}
                      transition={{ 
                        duration: duration, 
                        repeat: Infinity, 
                        delay: drip.delay,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.75, 0.9, 1]
                      }}
                    >
                      <defs>
                        <linearGradient id={`bloodDripGrad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3f0712" />
                          <stop offset="40%" stopColor="#881337" />
                          <stop offset="85%" stopColor="#e11d48" />
                          <stop offset="100%" stopColor="#4c0519" />
                        </linearGradient>
                      </defs>
                      <path d={selectedPath} fill={`url(#bloodDripGrad-${i})`} />
                      <ellipse cx="10" cy="85" rx="1.5" ry="3.5" fill="white" opacity="0.4" />
                    </motion.svg>
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.div 
                animate={{ textShadow: ['0 0 10px #f43f5e', '0 0 30px #e11d48', '0 0 10px #f43f5e'] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-[12px] font-black tracking-[0.45em] text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                FIRST BLOOD ACHIEVED
              </motion.div>
              
              <div className="mt-3 relative text-4xl font-black uppercase tracking-[0.12em] text-red-600">
                <span className="drop-shadow-[0_0_18px_rgba(220,38,38,0.95)]">FIRST BLOOD</span>
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0, 1, 0, 0.8, 0], x: [-2, 2, -1, 3, 0] }}
                  transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 2.5 }}
                  className="absolute left-0 top-0 text-rose-400 translate-x-[2px] mix-blend-screen"
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
                <div className="text-3xl font-extrabold text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]">
                  {featuredFirstBlood.log_username || 'unknown'}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="h-[1px] w-8 bg-red-600/50"></span>
                  <span className="text-xs uppercase tracking-[0.25em] text-rose-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">SLAUGHTERED</span>
                  <span className="h-[1px] w-8 bg-red-600/50"></span>
                </div>
                <div className="mt-2 text-2xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
                  {featuredFirstBlood.log_challenge_title}
                </div>
                <div className="mt-4 px-3 py-1 border border-red-900/50 bg-red-950/40 rounded text-[10px] uppercase tracking-[0.25em] text-zinc-400">
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
