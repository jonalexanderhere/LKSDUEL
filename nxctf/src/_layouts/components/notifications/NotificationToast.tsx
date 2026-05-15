'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Trophy, X } from 'lucide-react'

type NotificationToastProps = {
  solveNotif: { username: string; challenge: string; isFirstBlood?: boolean } | null
  notifToast: { title: string; message: string } | null
  onDismissSolve: () => void
  onDismissToast: () => void
}

export default function NotificationToast({
  solveNotif,
  notifToast,
  onDismissSolve,
  onDismissToast,
}: NotificationToastProps) {
  return (
    <div className="fixed top-16 right-4 z-[5000] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {/* Real-time solve notification */}
        {solveNotif && (
          <motion.div
            key="solve-notif"
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto relative flex items-center gap-4 px-5 py-4 rounded-xl shadow-2xl overflow-hidden min-w-[280px] max-w-[400px] border
              ${solveNotif.isFirstBlood 
                ? 'bg-gradient-to-br from-red-600 via-red-700 to-black border-red-500/50 text-white' 
                : 'bg-zinc-900/95 backdrop-blur-md border-zinc-800 text-zinc-100'}
            `}
          >
            {/* Background Glow for First Blood */}
            {solveNotif.isFirstBlood && (
              <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-red-500/20"
              />
            )}

            <div className={`relative flex-shrink-0 p-2.5 rounded-lg
              ${solveNotif.isFirstBlood ? 'bg-white/10' : 'bg-orange-500/10 text-orange-500'}
            `}>
              {solveNotif.isFirstBlood ? <Trophy size={20} className="text-yellow-400" /> : <Bell size={20} />}
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-sm font-bold truncate ${solveNotif.isFirstBlood ? 'text-white' : 'text-zinc-100'}`}>
                  {solveNotif.username}
                </span>
                {solveNotif.isFirstBlood && (
                  <motion.span 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  >
                    First Blood
                  </motion.span>
                )}
              </div>
              <p className={`text-xs leading-snug ${solveNotif.isFirstBlood ? 'text-red-100' : 'text-zinc-400'}`}>
                {solveNotif.isFirstBlood ? 'Eliminated challenge ' : 'Just solved '}
                <span className={`font-bold ${solveNotif.isFirstBlood ? 'text-white underline decoration-red-500/50' : 'text-zinc-200'}`}>
                  {solveNotif.challenge}
                </span>
              </p>
            </div>

            <button
              onClick={onDismissSolve}
              className={`relative ml-2 p-1.5 rounded-md transition-colors
                ${solveNotif.isFirstBlood ? 'hover:bg-white/10 text-red-200' : 'hover:bg-zinc-800 text-zinc-500'}
              `}
            >
              <X size={16} />
            </button>

            {/* Progress Bar for timeout */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: 0 }}
              transition={{ duration: 12, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-0.5 
                ${solveNotif.isFirstBlood ? 'bg-yellow-400/50' : 'bg-orange-500/50'}
              `}
            />
          </motion.div>
        )}

        {/* Real-time notification toast */}
        {notifToast && (
          <motion.div
            key="notif-toast"
            layout
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-start gap-3 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-zinc-100 px-4 py-4 rounded-xl shadow-2xl max-w-[420px]"
          >
            <div className="mt-0.5 p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="text-sm font-bold text-zinc-100 mb-1">{notifToast.title}</div>
              <div className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{notifToast.message}</div>
            </div>
            <button
              onClick={onDismissToast}
              className="ml-2 p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

