"use client"

// React Imports
import { motion } from "framer-motion"
import {
  Trophy, Users, Zap, Shield, ArrowRight,
  ListChecks, Server, CalendarDays, Terminal
} from 'lucide-react'
import Link from "next/link"

// Shared Imports
import APP from '@/config'
import { Loader, BrandLogo } from '@/shared/components'
import { Footer } from "@/_layouts"

const FEATURES = [
  {
    icon: Trophy,
    title: "Real-time Scoreboard",
    description: "Compete with live updates, dynamic scoring, and real-time rank tracking."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Form squads, share progress, and climb the leaderboard together."
  },
  {
    icon: Zap,
    title: "Dynamic Challenges",
    description: "Deploy isolated, ephemeral instances for each challenge environment."
  },
  {
    icon: ListChecks,
    title: "Multi-Task Challenges",
    description: "Solve complex challenges by answering multiple sub-questions to get the flag."
  },
  {
    icon: Server,
    title: "NXCTL Instance",
    description: "On-demand service creation. Spin up your own challenge environment instantly."
  },
  {
    icon: CalendarDays,
    title: "Multi-Event Management",
    description: "Host and manage multiple CTF events simultaneously with ease."
  },
  {
    icon: Terminal,
    title: "Flag Placeholders",
    description: "Customizable flag formats and placeholders for complex challenge scenarios."
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Robust security with seamless login flows and role-based access control."
  }
]

export default function Home() {
  const { user, loading } = require("@/shared/contexts").useAuth();

  if (loading) {
    return <Loader fullscreen color="text-blue-500" />
  }

  return (
    // <div className="flex flex-col min-h-[calc(100lvh-60px)] bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-blue-500/30">
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-gray-900 dark:text-gray-100 selection:bg-blue-500/30 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Main Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.15] dark:opacity-[0.25]"
          style={{ backgroundImage: 'url("/darmajaya-bg.png")' }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa]/80 via-transparent to-[#fafafa] dark:from-[#09090b]/80 dark:via-transparent dark:to-[#09090b]" />
        
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6 py-10 lg:py-16">
        {/* HERO SECTION */}
        <section className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-blue-950/20 border border-gray-200 dark:border-blue-500/20 backdrop-blur-md mb-6 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-600 dark:text-blue-200/70">
              {APP.shortName} Flag format: <span className="font-mono text-blue-600 dark:text-blue-400">{APP.flagFormat}</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl mb-4"
          >
            <BrandLogo name={APP.fullName} className="scale-110" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-8 leading-relaxed"
          >
            {APP.description} Rise from the ashes with <b>on-demand instances</b>, complex multi-step tasks, and elite event management.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href={user ? "/challenges" : "/login"}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white transition-all bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {user ? "Enter Arena" : "Join the Arena"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/info"
              className="px-8 py-3 text-sm font-bold transition-all rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
            >
              View Rules
            </Link>
          </motion.div>
        </section>

        {/* FEATURES GRID */}
        <section className="w-full max-w-6xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer group relative p-6 bg-white/40 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-zinc-900/80 hover:shadow-[0_10px_30px_rgba(249,115,22,0.1)]"
                >
                  <div className="mb-4 inline-flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 leading-normal">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
        {/* IN COLLABORATION WITH */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-4xl mx-auto mt-20 mb-10 text-center"
        >
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-[0.3em] mb-6">
            In collaboration with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-80 hover:opacity-100 transition-opacity duration-500">
            <div className="flex flex-col items-center gap-3">
              <img src="/phoenix-cysec.png" alt="Phoenix Cysec" className="h-16 w-auto object-contain brightness-110" />
              <span className="text-[10px] font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                PHOENIX <span className="text-blue-600">CYSEC</span>
              </span>
            </div>
            <div className="h-12 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
            <div className="flex flex-col items-center gap-3">
              <img src="/dcsc-logo.png" alt="DCSC" className="h-16 w-auto object-contain brightness-110" />
              <span className="text-[10px] font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                Darmajaya <span className="text-red-600">Cyber Security Club</span>
              </span>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}
