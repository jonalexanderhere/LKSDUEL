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
  const [resolvedTeamName, setResolvedTeamName] = useState<string>("")
  const [dismissed, setDismissed] = useState(false)
  const [cardPhase, setCardPhase] = useState<'splash' | 'details'>('splash')
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
    if (!featuredFirstBlood || !featuredFirstBlood.log_user_id) {
      setResolvedTeamName("")
      return
    }

    (async () => {
      try {
        const { supabase } = await import('@/shared/lib/supabase')
        const { data } = await supabase
          .from('team_members')
          .select('teams(name)')
          .eq('user_id', featuredFirstBlood.log_user_id)
          .limit(1)
          .maybeSingle()
        const name = (data as any)?.teams?.name
        if (name) {
          setResolvedTeamName(name)
        } else {
          setResolvedTeamName("")
        }
      } catch (err) {
        console.warn("Failed to resolve team name", err)
        setResolvedTeamName("")
      }
    })()
  }, [featuredFirstBlood])

  useEffect(() => {
    setDismissed(false)
    setCardPhase('splash')
    const t1 = setTimeout(() => {
      setCardPhase('details')
    }, 1800)
    const t2 = setTimeout(() => {
      setDismissed(true)
    }, 8800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [featuredFirstBlood?.log_challenge_id, featuredFirstBlood?.log_created_at])

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

  if (loading && notifications.length === 0) return <Loader fullscreen color="text-amber-600 dark:text-amber-500" />;

  if (filteredNotifications.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border rounded-sm px-4 py-6 shadow bg-[#fdf6e3] dark:bg-[#1A100C] dark:border-gray-700 flex flex-col items-center justify-center text-center text-sm text-gray-600 dark:text-gray-300"
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
    <div className="space-y-4">
      {/* Google Fonts Link & Styles loaded globally for perfect synchronization */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&display=swap" />
      <style dangerouslySetInnerHTML={{__html: `
        .font-nosifer {
          font-family: 'Nosifer', sans-serif !important;
        }
        .font-creepster {
          font-family: 'Creepster', cursive !important;
        }
      `}} />

      {/* Global SVG Filters for liquid/gooey blood effects */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <filter id="gooey-blood">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <AnimatePresence mode="popLayout">
        {tabType === 'firstblood' && featuredFirstBlood && !dismissed && (
          <motion.div
            key={`featured-${featuredFirstBlood.log_challenge_id}`}
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
            }}
            exit={{ opacity: 0, scale: 0.95, y: -10, filter: 'blur(8px)' }}
            transition={{ 
              default: { type: 'spring', stiffness: 130, damping: 20 }
            }}
            className="relative w-full overflow-hidden rounded-sm border-double border-4 border-amber-900/70 border border-red-950 bg-black/95 px-5 py-12 shadow-[0_0_35px_rgba(136,19,55,0.25)]"
          >
            {/* Dismiss Button */}
            <button 
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 z-30 text-red-500 hover:text-white transition-colors text-2xl font-bold bg-black/40 hover:bg-red-950/40 w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto cursor-pointer"
              title="Close"
            >
              &times;
            </button>

            {/* Dark moving blood mist */}
            <motion.div
              animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.02, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(136,19,55,0.45),transparent_75%)] pointer-events-none"
            />

            {/* Diagonal Glossy Glass Screen Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

            {/* High-Fidelity Background Splatters with volumetric Radial Gradients (Perfect liquid depth) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  {/* Radial Gradient for Left Splatter */}
                  <radialGradient id="splatGradLeft" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#220106" stopOpacity="0.8" />
                    <stop offset="25%" stopColor="#4c0519" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#881337" stopOpacity="0.55" />
                    <stop offset="85%" stopColor="#be123c" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
                  </radialGradient>
                  
                  {/* Radial Gradient for Right Splatter */}
                  <radialGradient id="splatGradRight" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e0207" stopOpacity="0.85" />
                    <stop offset="30%" stopColor="#4c0519" stopOpacity="0.75" />
                    <stop offset="65%" stopColor="#991b1b" stopOpacity="0.55" />
                    <stop offset="88%" stopColor="#dc2626" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                  </radialGradient>

                  {/* Volumetric Linear Gradients for Border Smears */}
                  <linearGradient id="smearGradBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#110002" />
                    <stop offset="35%" stopColor="#2c030a" />
                    <stop offset="70%" stopColor="#4c0519" />
                    <stop offset="90%" stopColor="#881337" />
                    <stop offset="100%" stopColor="#3b020c" />
                  </linearGradient>
                  <linearGradient id="smearGradOverlay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4c0519" />
                    <stop offset="25%" stopColor="#881337" />
                    <stop offset="60%" stopColor="#dc2626" />
                    <stop offset="85%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
              </svg>

              {/* High-density background micro-mist spray for premium realism */}
              <svg viewBox="0 0 1000 300" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <radialGradient id="microGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#be123c" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="150" cy="80" r="1.5" fill="url(#microGlow)" />
                <circle cx="155" cy="85" r="0.8" fill="url(#microGlow)" />
                <circle cx="140" cy="95" r="2" fill="url(#microGlow)" />
                <circle cx="170" cy="65" r="1.2" fill="url(#microGlow)" />
                <circle cx="180" cy="110" r="0.6" fill="url(#microGlow)" />
                
                <circle cx="210" cy="150" r="2.2" fill="url(#microGlow)" />
                <circle cx="230" cy="130" r="1.0" fill="url(#microGlow)" />
                <circle cx="225" cy="165" r="0.8" fill="url(#microGlow)" />
                
                <circle cx="820" cy="90" r="1.8" fill="url(#microGlow)" />
                <circle cx="810" cy="100" r="0.9" fill="url(#microGlow)" />
                <circle cx="840" cy="75" r="2.5" fill="url(#microGlow)" />
                <circle cx="835" cy="120" r="1.2" fill="url(#microGlow)" />
                
                <circle cx="780" cy="160" r="1.5" fill="url(#microGlow)" />
                <circle cx="795" cy="180" r="0.7" fill="url(#microGlow)" />
                <circle cx="765" cy="140" r="2" fill="url(#microGlow)" />
                
                <circle cx="500" cy="60" r="1.0" fill="url(#microGlow)" />
                <circle cx="480" cy="70" r="1.5" fill="url(#microGlow)" />
                <circle cx="530" cy="50" r="0.8" fill="url(#microGlow)" />
                <circle cx="510" cy="85" r="1.2" fill="url(#microGlow)" />
                <circle cx="450" cy="110" r="1.6" fill="url(#microGlow)" />
                <circle cx="550" cy="120" r="0.7" fill="url(#microGlow)" />
              </svg>

              {/* Left splatter */}
              <svg viewBox="0 0 200 200" className="absolute left-1/12 sm:left-1/6 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none filter blur-[0.5px]">
                <path d="M 80 80 Q 55 50, 60 70 T 40 90 T 55 120 T 90 140 T 130 130 T 140 100 T 110 70 Z" fill="url(#splatGradLeft)" />
                <path d="M 60 90 Q 20 110, 10 115" stroke="url(#splatGradLeft)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 110 80 Q 150 50, 160 45" stroke="url(#splatGradLeft)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 95 130 Q 110 170, 115 180" stroke="url(#splatGradLeft)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="30" cy="50" r="3" fill="url(#splatGradLeft)" />
                <circle cx="25" cy="125" r="2.5" fill="url(#splatGradLeft)" />
                <circle cx="170" cy="70" r="3.5" fill="url(#splatGradLeft)" />
                <circle cx="145" cy="160" r="2" fill="url(#splatGradLeft)" />
                <circle cx="80" cy="175" r="4" fill="url(#splatGradLeft)" />
              </svg>
              {/* Right splatter */}
              <svg viewBox="0 0 200 200" className="absolute right-1/12 sm:right-1/6 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none filter blur-[0.5px] rotate-115">
                <path d="M 80 80 Q 55 50, 60 70 T 40 90 T 55 120 T 90 140 T 130 130 T 140 100 T 110 70 Z" fill="url(#splatGradRight)" />
                <path d="M 60 90 Q 20 110, 10 115" stroke="url(#splatGradRight)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 110 80 Q 150 50, 160 45" stroke="url(#splatGradRight)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 95 130 Q 110 170, 115 180" stroke="url(#splatGradRight)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="30" cy="50" r="3" fill="url(#splatGradRight)" />
                <circle cx="25" cy="125" r="2.5" fill="url(#splatGradRight)" />
                <circle cx="170" cy="70" r="3.5" fill="url(#splatGradRight)" />
                <circle cx="145" cy="160" r="2" fill="url(#splatGradRight)" />
                <circle cx="80" cy="175" r="4" fill="url(#splatGradRight)" />
              </svg>
            </div>
            
            {/* Top Blood Smear/Border Layer 1 (Darker, thicker base gradient) */}
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-16 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] z-20 pointer-events-none">
              <path d="M 0 0 L 1000 0 L 1000 35 Q 980 45, 960 25 T 920 20 Q 900 50, 890 65 Q 880 70, 870 50 Q 860 25, 840 20 T 800 15 Q 785 40, 775 55 Q 765 60, 755 45 Q 745 25, 730 20 T 670 15 Q 650 35, 630 25 T 590 15 Q 570 50, 560 68 Q 550 72, 540 50 Q 530 25, 520 20 T 460 15 Q 440 35, 420 25 T 380 15 Q 365 40, 355 55 Q 345 60, 335 45 Q 325 25, 320 20 T 290 15 T 250 15 Q 230 40, 220 55 Q 210 60, 200 40 Q 190 20, 170 15 T 130 15 Q 110 35, 90 25 T 50 15 Q 30 40, 20 50 Q 10 52, 0 30 Z" fill="url(#smearGradBase)" />
            </svg>

            {/* Top Blood Smear/Border Layer 2 (Brighter overlay linear gradient for deep liquid 3D shine) */}
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-12 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] z-20 pointer-events-none">
              <path d="M 0 0 L 1000 0 L 1000 25 Q 980 32, 960 18 T 920 12 Q 900 35, 890 48 Q 880 52, 870 32 Q 860 18, 840 12 T 800 10 Q 785 28, 775 40 Q 765 42, 755 32 Q 745 18, 730 12 T 670 10 Q 650 20, 630 18 T 590 10 Q 570 35, 560 48 Q 550 52, 540 32 Q 530 18, 520 12 T 460 10 Q 440 20, 420 18 T 380 10 Q 365 28, 355 40 Q 345 42, 335 32 Q 325 18, 320 12 T 290 10 T 250 10 Q 230 28, 220 40 Q 210 42, 200 28 Q 190 12, 170 10 T 130 10 Q 110 22, 90 18 T 50 10 Q 30 28, 20 32 Q 10 35, 0 20 Z" fill="url(#smearGradOverlay)" />
            </svg>

            {/* Top Blood Smear/Border Layer 3 (Wet specular glossy highlights for extreme realism!) */}
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-[54px] z-20 pointer-events-none">
              <defs>
                <linearGradient id="specularGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0 0 L 1000 0 L 1000 15 Q 980 20, 960 10 T 920 8 Q 900 18, 890 24 Q 880 26, 870 18 Q 860 10, 840 8 T 800 6 Q 785 15, 775 20 Q 765 22, 755 18 Q 745 10, 730 8 T 670 6 Q 650 15, 630 12 T 590 6 Q 570 18, 560 24 Q 550 26, 540 18 Q 530 10, 520 8 T 460 6 Q 440 12, 420 10 T 380 6 Q 365 15, 355 20 Q 345 22, 335 18 Q 325 10, 320 8 T 290 6 T 250 6 Q 230 15, 220 20 Q 210 22, 200 15 Q 190 10, 170 8 T 130 8 Q 110 14, 90 12 T 50 6 Q 30 15, 20 18 Q 10 20, 0 12 Z" fill="url(#specularGrad)" />
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
                        y: [0, 0, 5, 12, 0],
                        rotate: [0, -1.2, 1.5, -0.8, 0]
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
                      {/* Realistic curved fluid reflection on dynamic drips */}
                      <path d="M 8 10 Q 16 25, 8 38 Q 20 25, 8 10 Z" fill="white" opacity="0.45" />
                    </motion.svg>
                  </div>
                );
              })}
            </div>

            {/* Pushed down pt-16 here to fully prevent dripping top SVG border overlap and maintain ultra-neat layout! */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-16 text-center w-full min-h-[220px]">
              <AnimatePresence mode="wait">
                {cardPhase === 'splash' ? (
                  <motion.div
                    key="splash-content"
                    initial={{ opacity: 0, scale: 0.82, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative flex flex-col items-center justify-center py-8 w-full overflow-visible"
                  >
                    {/* Splash Splatter Background Animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      {/* Gooey filter wrapper */}
                      <div 
                        className="relative w-80 h-80 flex items-center justify-center"
                        style={{ filter: "url(#gooey-blood)" }}
                      >
                        <motion.svg
                          viewBox="0 0 200 200"
                          className="w-48 h-48 filter drop-shadow-[0_0_15px_rgba(136,19,55,0.8)]"
                          initial={{ scale: 0.1, opacity: 0, rotate: -45 }}
                          animate={{ 
                            scale: [0.1, 1.1, 1],
                            opacity: [0, 1, 0.95],
                            rotate: [-45, 10, 0]
                          }}
                          transition={{ 
                            duration: 0.5,
                            ease: "easeOut",
                          }}
                        >
                          <defs>
                            <radialGradient id="centerSplashGrad" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#be123c" />
                              <stop offset="40%" stopColor="#991b1b" />
                              <stop offset="75%" stopColor="#450a0a" />
                              <stop offset="100%" stopColor="#180003" />
                            </radialGradient>
                          </defs>
                          {/* Organic main splash body with specular lighting */}
                          <path d="M 100 100 C 90 85, 75 75, 70 90 C 65 105, 55 110, 60 125 C 65 140, 80 145, 95 140 C 110 135, 125 145, 135 135 C 145 125, 140 105, 130 95 C 120 85, 110 90, 100 100 Z" fill="url(#centerSplashGrad)" />
                          <path d="M 75 92 C 85 82, 115 82, 125 92 C 115 86, 85 86, 75 92 Z" fill="#ffffff" opacity="0.3" />
                        </motion.svg>

                        {/* Dynamic bursting droplets - Spray Group (32 droplets) */}
                        {Array.from({ length: 32 }).map((_, i) => {
                          const angle = (i * 360) / 32 + (Math.random() * 15 - 7.5);
                          const distance = 60 + Math.random() * 95; // travels further
                          const rad = (angle * Math.PI) / 180;
                          const targetX = Math.cos(rad) * distance;
                          const targetY = Math.sin(rad) * distance;
                          const size = 5 + Math.random() * 8; // small-medium spray
                          const delay = Math.random() * 0.1;
                          const duration = 0.4 + Math.random() * 0.3;

                          return (
                            <motion.div
                              key={`spray-drop-${i}`}
                              className="absolute rounded-full bg-gradient-to-br from-red-600 via-red-800 to-rose-950 shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                              style={{
                                width: size,
                                height: size,
                                transformOrigin: "center",
                              }}
                              initial={{ x: 0, y: 0, scale: 0.1, opacity: 0 }}
                              animate={{
                                x: [0, targetX * 0.5, targetX],
                                y: [0, targetY * 0.5, targetY],
                                scale: [0.1, 1.3, 1, 0.85],
                                opacity: [0, 1, 1, 0.95],
                              }}
                              transition={{
                                duration: duration,
                                ease: [0.1, 0.8, 0.2, 1], // sharp deceleration
                                delay: delay,
                              }}
                            >
                              <span className="absolute top-0.5 left-0.5 w-[30%] h-[30%] bg-[#fdf6e3] rounded-full opacity-70" />
                            </motion.div>
                          );
                        })}

                        {/* Dynamic bursting droplets - Heavy Gravitational Group (16 droplets) */}
                        {Array.from({ length: 16 }).map((_, i) => {
                          const angle = (i * 360) / 16 + (Math.random() * 30 - 15);
                          const distance = 40 + Math.random() * 55; 
                          const rad = (angle * Math.PI) / 180;
                          const targetX = Math.cos(rad) * distance;
                          // add gravity pull downwards to the Y position
                          const targetY = Math.sin(rad) * distance;
                          const gravityY = targetY + 30 + Math.random() * 20;
                          const size = 11 + Math.random() * 10; // larger size
                          const delay = 0.05 + Math.random() * 0.15;
                          const duration = 0.7 + Math.random() * 0.4;

                          return (
                            <motion.div
                              key={`heavy-drop-${i}`}
                              className="absolute rounded-full bg-gradient-to-br from-red-700 via-red-900 to-black shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                              style={{
                                width: size,
                                height: size,
                                transformOrigin: "center",
                              }}
                              initial={{ x: 0, y: 0, scale: 0.1, opacity: 0 }}
                              animate={{
                                x: [0, targetX * 0.6, targetX],
                                y: [0, targetY, gravityY],
                                scale: [0.1, 1.2, 1.1, 1],
                                opacity: [0, 1, 1, 0.95],
                              }}
                              transition={{
                                duration: duration,
                                ease: [0.15, 0.6, 0.35, 1],
                                delay: delay,
                              }}
                            >
                              <span className="absolute top-1 left-1 w-[25%] h-[25%] bg-[#fdf6e3] rounded-full opacity-60" />
                            </motion.div>
                          );
                        })}

                        {/* Dripping blood from center impact (8 drips) */}
                        {Array.from({ length: 8 }).map((_, i) => {
                          const startX = -45 + i * 13 + (Math.random() * 6 - 3);
                          const dripLength = 45 + Math.random() * 85;
                          const delay = 0.25 + Math.random() * 0.25; // drips start slightly after initial burst
                          const duration = 1.6 + Math.random() * 1.0;

                          return (
                            <motion.div
                              key={`core-drip-${i}`}
                              className="absolute bg-gradient-to-b from-red-800 via-red-950 to-rose-950 rounded-b-full"
                              style={{
                                left: `calc(50% + ${startX}px)`,
                                top: "50%",
                                width: 4 + Math.random() * 4,
                                transformOrigin: "top center",
                              }}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{
                                height: [0, dripLength, dripLength],
                                opacity: [0, 1, 0.9],
                              }}
                              transition={{
                                duration: duration,
                                ease: "easeOut",
                                delay: delay,
                              }}
                            >
                              <span className="absolute bottom-0.5 left-0.5 right-0.5 h-1 bg-rose-600 rounded-full opacity-40" />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Splash Title */}
                    <div className="relative z-10 text-4xl sm:text-5xl font-bold uppercase tracking-wider font-nosifer text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.95)] select-none">
                      FIRST BLOOD
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="details-content"
                    initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    {/* Subtle top indicator */}
                    <div className="text-[10px] font-mono tracking-[0.45em] text-red-500/80 font-bold uppercase mb-2">
                      FIRST BLOOD ACHIEVED
                    </div>

                    {/* Main Heading */}
                    <div className="text-3xl sm:text-4xl font-bold uppercase tracking-wider font-nosifer text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.85)] select-none mb-6">
                      FIRST BLOOD
                    </div>

                    {/* Username */}
                    <div className="text-3xl sm:text-4xl font-bold text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)] tracking-wide font-creepster mb-1">
                      {featuredFirstBlood.log_username || 'unknown'}
                    </div>
                    
                    {/* Sleek, raw team badge */}
                    {resolvedTeamName && (
                      <div className="mt-2 mb-4 text-xs uppercase tracking-[0.25em] text-red-500 font-mono font-bold">
                        [ {resolvedTeamName} ]
                      </div>
                    )}

                    {/* Challenge Title */}
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-600 font-creepster drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] tracking-wide mb-6">
                      {featuredFirstBlood.log_challenge_title}
                    </div>

                    {/* Challenge Category Text - Styled beautifully as a bottom tag */}
                    <div className="mt-2 text-[10px] font-mono font-bold tracking-[0.25em] text-rose-400 uppercase bg-red-950/40 border border-red-900/60 rounded-full px-4 py-1">
                      Category: {featuredFirstBlood.log_category}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
            className={`border rounded-sm px-4 py-3 shadow flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm transition-colors duration-150 min-w-0 ${
              notif.log_type === "first_blood"
                ? "bg-gradient-to-r from-red-100 via-red-50 to-white border-red-400 dark:from-red-950/80 dark:via-red-900/40 dark:to-black dark:border-red-700/60 hover:bg-red-100/80 dark:hover:bg-red-900/50"
                : "bg-[#fdf6e3] dark:bg-[#1A100C] dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
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
                  <span className="font-semibold text-amber-700 dark:text-amber-500 dark:text-blue-300">New Challenge:</span>
                  <span className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-block">{notif.log_challenge_title}</span>
                  <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
                </>
              ) : notif.log_type === "first_blood" ? (
                <>
                  <span className="inline-flex items-center rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-black tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.6)]">FIRST BLOOD</span>
                  <motion.span animate={{ opacity: [0.35, 0.9, 0.35] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="inline-flex items-center gap-1 min-w-0">
                    <Link href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"} className="text-amber-700 dark:text-amber-500 dark:text-blue-300 font-medium hover:underline">
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
                    <Link href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"} className="text-amber-700 dark:text-amber-500 dark:text-blue-300 font-medium hover:underline">
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

