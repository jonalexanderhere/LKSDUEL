"use client"

// React Imports
import { motion } from "framer-motion"
import {
  Map, Shield, Sword, Scroll, Crown, 
  Sparkles, Castle, Skull, ChevronRight, Gem
} from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

// Shared Imports
import APP from '@/config'
import { Loader } from '@/shared/components'
import { Footer } from "@/_layouts"

const FEATURES = [
  {
    icon: Scroll,
    title: "Epic Quests",
    description: "Embark on perilous journeys, solve ancient riddles, and claim the flags hidden within."
  },
  {
    icon: Shield,
    title: "Form Your Guild",
    description: "Gather your party. Strategize, share knowledge, and conquer the leaderboards together."
  },
  {
    icon: Castle,
    title: "Mystical Dungeons",
    description: "Conjure isolated instances. Enter your own ephemeral dungeon without interference."
  },
  {
    icon: Map,
    title: "Multi-Path Trials",
    description: "Complex challenges with multiple stages. Uncover every secret to earn the final artifact."
  },
  {
    icon: Sparkles,
    title: "Magic Instances",
    description: "Summon services on-demand. A personal realm to practice your arcane hacking arts."
  },
  {
    icon: Crown,
    title: "Kingdom Management",
    description: "Host multiple grand tournaments and events simultaneously across the realm."
  },
  {
    icon: Sword,
    title: "Weapon Forging",
    description: "Customizable flag formats to match the specific lore of your current adventure."
  },
  {
    icon: Skull,
    title: "Fortified Vaults",
    description: "Impenetrable security protecting player data with powerful magical wards."
  }
]

export default function Home() {
  const { user, loading } = require("@/shared/contexts").useAuth();

  if (loading) {
    return <Loader fullscreen color="text-amber-500" />
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#110C0B] text-[#E8DCC4] selection:bg-amber-600/30 overflow-hidden font-serif">
      
      {/* Background Magic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity transition-opacity duration-1000"
          style={{ backgroundImage: 'url("/fantasy-bg.png")' }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#110C0B]/80 to-[#110C0B]" />
        
        {/* Magical floating embers */}
        <motion.div 
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-amber-500/20 blur-[80px]" 
        />
        <motion.div 
          animate={{ y: [20, -20, 20], x: [10, -10, 10], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full bg-orange-600/20 blur-[100px]" 
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6 py-10 lg:py-20 border-b-4 border-amber-900/50">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 mt-4 lg:mt-10">
          
          {/* Left Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-none border-y-2 border-amber-500/40 bg-black/40 backdrop-blur-md mb-8"
            >
              <Gem className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-sm uppercase tracking-[0.2em] font-bold text-amber-200/90 drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)]">
                The Realm of {APP.shortName}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="text-6xl sm:text-7xl lg:text-[6rem] font-black tracking-widest mb-6 text-transparent bg-clip-text bg-gradient-to-b from-[#FFF3D4] via-[#F2C94C] to-[#C98A2C] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              {APP.fullName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-[#C4A484] max-w-2xl mb-10 leading-relaxed drop-shadow-lg font-medium"
            >
              Enter the grand colosseum of cyber wizards. Forage for mythical flags, conquer dark dungeons, and etch your name into the ancient Hall of Fame.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
            >
              <Link
                href={user ? "/challenges" : "/login"}
                className="group relative flex w-full sm:w-auto items-center justify-center gap-3 px-10 py-4 text-lg font-bold text-[#3E2723] transition-all bg-gradient-to-b from-[#FFD54F] to-[#FF8F00] hover:from-[#FFE082] hover:to-[#FFA000] border-2 border-[#FFC107] rounded-sm overflow-hidden shadow-[0_0_20px_rgba(255,193,7,0.4)]"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 mix-blend-overlay"></div>
                <span className="relative z-10 flex items-center gap-2 uppercase tracking-wider">
                  {user ? "Begin Quest" : "Enter the Tavern"}
                  <Sword className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                </span>
              </Link>
              <Link
                href="/info"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 text-base font-bold transition-all rounded-sm bg-[#2D1B15]/80 border border-[#8D6E63] text-[#D7CCC8] hover:bg-[#3E2723] hover:text-[#EFEBE9] hover:border-[#BCAAA4]"
              >
                Read the Lore
                <Scroll className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-14 flex items-center gap-3 text-sm font-semibold text-[#8D6E63] uppercase tracking-widest bg-black/30 px-4 py-2 rounded-sm border border-[#4E342E]"
            >
              <Shield className="w-4 h-4 text-[#A1887F]" />
              <span>Artifact Format: <span className="text-[#FFB300] font-mono tracking-wider ml-2">{APP.flagFormat}</span></span>
            </motion.div>
          </div>

          {/* Right Floating Logo / Crest */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 70 }}
            className="flex-1 flex justify-center lg:justify-end w-full max-w-md lg:max-w-none relative"
          >
            <div className="relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] flex items-center justify-center">
              {/* Magical Aura */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,160,0,0.4)_0%,_rgba(0,0,0,0)_70%)] animate-pulse" />
              <div className="absolute inset-4 border-[1px] border-dashed border-amber-500/30 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-10 border-[1px] border-dotted border-orange-500/40 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              
              <motion.img
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src="/lks-980x917.png" 
                alt="LKS DUEL Crest" 
                className="w-[85%] h-[85%] object-contain relative z-10 drop-shadow-[0_0_40px_rgba(255,160,0,0.5)]"
              />
            </div>
          </motion.div>

        </section>

        {/* FEATURES GRID - THE ADVENTURER'S HANDBOOK */}
        <section className="w-full max-w-6xl mx-auto mt-40 relative z-10 mb-20">
          <div className="text-center mb-20 flex flex-col items-center">
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-6" />
            <h2 className="text-4xl sm:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD54F] to-[#F57C00] uppercase tracking-widest font-serif">
              The Adventurer's Codex
            </h2>
            <p className="text-[#BCAAA4] max-w-2xl mx-auto text-lg leading-relaxed">
              Equip yourself with the finest tools and arcane knowledge required to survive the trials of the digital realm.
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="group relative p-8 bg-[#251814]/80 border-2 border-[#5D4037] hover:border-[#FFB300] transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden rounded-sm"
                >
                  {/* Parchment texture overlay */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 mix-blend-overlay"></div>
                  
                  {/* Corner ornaments */}
                  <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-600/50" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-600/50" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber-600/50" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-600/50" />

                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A100C] border-2 border-[#4E342E] group-hover:border-[#FFCA28] text-[#FFB300] group-hover:text-[#FFE082] transition-colors duration-300 shadow-inner relative z-10">
                    <Icon className="w-8 h-8" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-[#FFE082] mb-3 font-serif tracking-wide group-hover:text-[#FFF8E1]">
                      {feature.title}
                    </h3>
                    <p className="text-[#A1887F] leading-relaxed text-sm group-hover:text-[#D7CCC8]">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFB300]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              )
            })}
          </motion.div>
        </section>

      </main>

      <div className="relative z-20 bg-[#0A0706] border-t-2 border-[#3E2723]">
        <Footer />
      </div>
    </div>
  )
}

