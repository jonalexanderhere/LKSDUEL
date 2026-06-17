'use client'

// React Imports
import Link from 'next/link'
import { Info, BookOpen, Flag, Trophy, Shield, FileText, Users, Scale, User, Settings2, Flame } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'

// Shared Imports
import APP from '@/config'
import { ImageWithFallback } from '@/shared/components'
import { DevConfigDialog } from './components'
import { isAdmin, isGlobalAdmin } from '@/shared/lib'
import { AuthService } from '@/features/auth'
import { useTheme, useAuth, useLogs } from '@/shared/contexts'

// Internal Imports
import { useNotifications } from './hooks/useNotifications'
import NotificationBell from './components/notifications/NotificationBell'
import NotificationPanel from './components/notifications/NotificationPanel'
import NotificationToast from './components/notifications/NotificationToast'

export default function Navbar() {
  const router = useRouter()
  const { user, setUser, loading } = useAuth()
  const { unreadCount: logsUnreadCount } = useLogs()
  const pathname = usePathname()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminStatus, setAdminStatus] = useState(false)
  const [globalAdminStatus, setGlobalAdminStatus] = useState(false)

  const [scoreboardOpen, setLeaderboardOpen] = useState(false)
  const scoreboardMenuRef = useRef<HTMLDivElement | null>(null)

  const [docsOpen, setDocsOpen] = useState(false)
  const docsMenuRef = useRef<HTMLDivElement | null>(null)

  const { theme, toggleTheme } = useTheme()
  const avatarSrc = user?.profile_picture_url || user?.picture || null

  const [devConfigOpen, setDevConfigOpen] = useState(false)

  // Notifications Hook
  const {
    notifOpen,
    setNotifOpen,
    notifLoading,
    notifUnreadCount,
    notifItems,
    notifTitle,
    setNotifTitle,
    notifMessage,
    setNotifMessage,
    notifLevel,
    setNotifLevel,
    solveNotif,
    notifToast,
    solveSoundEnabled,
    setSolveSoundEnabled,
    notifPanelRef,
    notifButtonRef,
    markAllNotificationsRead,
    openNotifPanel,
    handleSendNotif,
    handleDeleteNotif,
    dismissSolveNotif,
    dismissNotifToast,
    isNotifRead,
    getLevelBadgeClass,
  } = useNotifications()

  useEffect(() => {
    if (user) {
      isAdmin().then(setAdminStatus)
      isGlobalAdmin().then(setGlobalAdminStatus)
    } else {
      setAdminStatus(false)
      setGlobalAdminStatus(false)
    }
  }, [user])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await AuthService.signOut()
    setUser(null)
    setAdminStatus(false)
    setGlobalAdminStatus(false)
    router.push('/login')
  }

  const showTeamLeaderboard = APP.teams.enabled
  const showUserLeaderboard = !showTeamLeaderboard || !APP.teams.hideLeaderboardIndividual
  const scoreboardOptionCount = Number(showUserLeaderboard) + Number(showTeamLeaderboard)

  useEffect(() => {
    if (!scoreboardOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!scoreboardMenuRef.current) return
      if (!scoreboardMenuRef.current.contains(event.target as Node)) {
        setLeaderboardOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [scoreboardOpen])

  useEffect(() => {
    if (!docsOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!docsMenuRef.current) return
      if (!docsMenuRef.current.contains(event.target as Node)) {
        setDocsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [docsOpen])

  useEffect(() => {
    setNotifOpen(false)
  }, [pathname, setNotifOpen])

  if (loading) return null

  return (
    <>
      <NotificationToast
        solveNotif={solveNotif}
        notifToast={notifToast}
        onDismissSolve={dismissSolveNotif}
        onDismissToast={dismissNotifToast}
        onToastClick={() => {
          openNotifPanel(true)
          dismissNotifToast()
        }}
      />

      <nav className={`shadow-[0_4px_12px_rgba(0,0,0,0.6)] border-b-4 border-amber-900 fixed top-0 left-0 w-full z-50 ${theme === 'dark' ? 'bg-[#1a0f0a]' : 'bg-[#3e2723]'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex min-w-0 flex-1 items-center space-x-4 2xl:space-x-6">
              <Link href="/" className="flex shrink-0 items-center gap-2 group" data-tour="navbar-logo">
                <ImageWithFallback
                  src={APP.image_logo}
                  alt={`${APP.shortName} logo`}
                  size={42}
                  className="rounded-full"
                />
                <span className={`text-[1.35rem] font-extrabold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-amber-100'} transition-all duration-200 group-hover:text-amber-500  dark:group-hover:text-amber-500 `}>{APP.shortName}</span>
              </Link>

              {/* Desktop menu */}
              <div className="hidden min-w-0 flex-nowrap items-center gap-1 xl:flex 2xl:gap-1.5 overflow-x-auto scroll-hidden">
                {user && (
                  <Link
                    href="/challenges"
                    className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                    data-tour="navbar-challenges"
                  >
                    <Flag size={18} /> Quests
                  </Link>
                )}

                {user && scoreboardOptionCount > 0 && (
                  scoreboardOptionCount === 1 ? (
                    <Link
                      href={showTeamLeaderboard ? '/teams/scoreboard' : '/scoreboard'}
                      className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                      data-tour="navbar-scoreboard"
                    >
                      <Trophy size={18} /> Leaderboard
                    </Link>
                  ) : (
                    <div ref={scoreboardMenuRef} className="relative flex-none">
                      <button
                        type="button"
                        data-tour="navbar-scoreboard"
                        onClick={() => setLeaderboardOpen((v) => !v)}
                        className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                      >
                        <Trophy size={18} /> Leaderboard
                        <svg className={`ml-1 h-3 w-3 opacity-70 transition-transform ${scoreboardOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.29a.75.75 0 0 1-.02-1.08Z" />
                        </svg>
                      </button>
                      {scoreboardOpen && (
                        <div className={`absolute left-0 mt-2 min-w-[200px] rounded-lg border shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-[#1A100C]/90 border-gray-200 text-amber-100'}`}>
                          {showUserLeaderboard && (
                            <Link
                              href="/scoreboard"
                              onClick={() => setLeaderboardOpen(false)}
                              className={`block px-3 py-2 text-sm ${showTeamLeaderboard ? 'rounded-t-lg' : 'rounded-lg'} ${theme === 'dark' ? 'hover:bg-amber-900/30' : 'hover:bg-[#2D1B15]'}`}
                            >
                              <span className="flex items-center">
                                <User size={18} className="mr-1" />
                                User Leaderboard
                              </span>
                            </Link>
                          )}
                          {showTeamLeaderboard && (
                            <Link
                              href="/teams/scoreboard"
                              onClick={() => setLeaderboardOpen(false)}
                              className={`block px-3 py-2 text-sm ${showUserLeaderboard ? 'rounded-b-lg' : 'rounded-lg'} ${theme === 'dark' ? 'hover:bg-amber-900/30' : 'hover:bg-[#2D1B15]'}`}
                            >
                              <span className="flex items-center">
                                <Users size={18} className="mr-1" />
                                Team Leaderboard
                              </span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {user && APP.teams.enabled && (
                  <Link
                    href="/teams"
                    className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                  >
                    <Users size={18} /> Guilds
                  </Link>
                )}

                {!user && (
                  <Link
                    href="/preview"
                    className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                  >
                    <FileText size={18} /> Preview
                  </Link>
                )}

                {/* Info Dropdown */}
                <div ref={docsMenuRef} className="relative flex-none">
                  <button
                    type="button"
                    data-tour="navbar-docs"
                    onClick={() => setDocsOpen((v) => !v)}
                    className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                  >
                    <Info size={18} /> Info
                    <svg className={`ml-1 h-3 w-3 opacity-70 transition-transform ${docsOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.29a.75.75 0 0 1-.02-1.08Z" />
                    </svg>
                  </button>
                  {docsOpen && (
                    <div className={`absolute left-0 mt-2 min-w-[200px] rounded-lg border shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-[#1A100C]/90 border-gray-200 text-amber-100'}`}>
                      <Link
                        href="/info"
                        onClick={() => setDocsOpen(false)}
                        className={`block px-3 py-2 text-sm rounded-t-lg ${theme === 'dark' ? 'hover:bg-amber-900/30' : 'hover:bg-[#2D1B15]'}`}
                        data-tour="navbar-info"
                      >
                        <span className="flex items-center">
                          <Info size={18} className="mr-1" />
                          Info
                        </span>
                      </Link>
                      <Link
                        href="/rules"
                        onClick={() => setDocsOpen(false)}
                        className={`block px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-amber-900/30' : 'hover:bg-[#2D1B15]'}`}
                        data-tour="navbar-rules"
                      >
                        <span className="flex items-center">
                          <Scale size={18} className="mr-1" />
                          Rules
                        </span>
                      </Link>
                      <Link
                        href={APP.nxctf.nxctf_docs}
                        target="_blank"
                        onClick={() => setDocsOpen(false)}
                        className={`block px-3 py-2 text-sm rounded-b-lg ${theme === 'dark' ? 'hover:bg-amber-900/30' : 'hover:bg-[#2D1B15]'}`}
                        data-tour="navbar-docs"
                      >
                        <span className="flex items-center">
                          <BookOpen size={18} className="mr-1" />
                          Docs
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                {user && (
                  <Link
                    href="/attack-feed"
                    className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${pathname === '/attack-feed' ? (theme === 'dark' ? 'text-red-400 bg-amber-900/20' : 'text-red-600 bg-red-50') : (theme === 'dark' ? 'text-gray-200 hover:text-red-400 hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-amber-500 ')}`}
                  >
                    <Flame size={18} className="text-red-600 dark:text-red-400 shrink-0" /> Attack Feed
                  </Link>
                )}

                {user && (
                  <Link
                    href="/hall-of-fame"
                    className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${pathname === '/hall-of-fame' ? (theme === 'dark' ? 'text-yellow-400 bg-amber-900/20' : 'text-yellow-600 bg-yellow-50') : (theme === 'dark' ? 'text-gray-200 hover:text-yellow-400 hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 focus:ring-2 focus:ring-amber-500 ')}`}
                  >
                    <Trophy size={18} className="text-yellow-500 dark:text-yellow-400 shrink-0" /> Hall of Fame
                  </Link>
                )}

                {adminStatus && user && (
                  <Link
                    href="/admin"
                    className={`h-10 px-2.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1.5 whitespace-nowrap text-sm 2xl:text-[15px] leading-none font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                  >
                    <Shield size={18} /> Admin
                  </Link>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex shrink-0 items-center gap-2 2xl:gap-4">
              <div className="hidden sm:flex items-center gap-2 2xl:gap-3">
                {user ? (
                  <>
                    <Link href="/profile" className="flex flex-shrink-0 items-center gap-2 group" data-tour="navbar-profile">
                      <ImageWithFallback src={avatarSrc} alt={user.username} size={36} className="rounded-sm border-2 border-amber-500/50" />
                      <span
                        className={`hidden xl:block text-[14px] font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'} transition-all duration-150 group-hover:text-amber-400 truncate whitespace-nowrap max-w-[120px]`}
                        title={user.username}
                      >
                        {user.username}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="hidden xl:block bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border-2 border-red-500/50 text-white px-3 py-1.5 rounded-sm text-[13px] font-bold shadow-[0_2px_8px_rgba(220,38,38,0.5)] transition-all duration-150 flex-shrink-0"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`px-4 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-amber-500  hover:bg-amber-500  text-white' : 'bg-amber-500  hover:bg-amber-500  text-white'}`}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={`px-4 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-amber-900/20 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Notifications */}
              {user && (
                <>
                  <NotificationBell
                    notifButtonRef={notifButtonRef}
                    notifOpen={notifOpen}
                    theme={theme}
                    unreadCount={notifUnreadCount}
                    onToggle={openNotifPanel}
                  />

                  <AnimatePresence>
                    {notifOpen && (
                      <NotificationPanel
                        theme={theme}
                        notifPanelRef={notifPanelRef}
                        setNotifOpen={setNotifOpen}
                        markAllNotificationsRead={markAllNotificationsRead}
                        solveSoundEnabled={solveSoundEnabled}
                        setSolveSoundEnabled={setSolveSoundEnabled}
                        globalAdminStatus={globalAdminStatus}
                        notifTitle={notifTitle}
                        setNotifTitle={setNotifTitle}
                        notifMessage={notifMessage}
                        setNotifMessage={setNotifMessage}
                        notifLevel={notifLevel}
                        setNotifLevel={setNotifLevel}
                        handleSendNotif={handleSendNotif}
                        notifLoading={notifLoading}
                        notifItems={notifItems}
                        isNotifRead={isNotifRead}
                        getLevelBadgeClass={getLevelBadgeClass}
                        handleDeleteNotif={handleDeleteNotif}
                      />
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Logs Icon */}
              {user && (
                <div className="relative mr-2" data-tour="navbar-logs">
                  <button
                    className={`rounded-full p-1 transition-colors duration-150 ${pathname === '/logs' ? (theme === 'dark' ? 'bg-amber-500 ' : 'bg-amber-500 ') : ''}`}
                    title="Logs"
                    aria-label="Logs"
                    onClick={() => {
                      if (pathname === '/logs') {
                        if (window.history.length > 1) {
                          router.back()
                        } else {
                          router.push('/')
                        }
                      } else {
                        router.push('/logs')
                      }
                    }}
                  >
                    <FileText size={22} className="text-amber-500 " />
                  </button>

                  {logsUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
                      {logsUnreadCount > 99 ? '99+' : String(logsUnreadCount)}
                    </span>
                  )}
                </div>
              )}

              {/* Dev Config */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setDevConfigOpen(true)}
                  className="p-1 rounded-full hover:bg-amber-500  dark:hover:bg-amber-500 /30 transition-colors mr-1"
                  title="Platform Setup (Dev Only)"
                >
                  <Settings2 size={22} className="text-amber-500 " />
                </button>
              )}

              {/* Theme Switcher - DISABLED TEMPORARILY */}
              {/* <button
                onClick={toggleTheme}
                className="focus:outline-none transition-colors duration-150 ml-1"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-moon transition-all duration-150">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sun transition-all duration-150">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </button> */}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-amber-900/30 transition-all duration-150"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className={`xl:hidden fixed inset-0 z-60 ${theme === 'dark' ? 'bg-gray-950/95' : 'bg-[#1A100C]/90/95'} transition-all duration-200 backdrop-blur-sm`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <span className={`text-lg font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-amber-100'}`}>Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-amber-900/30 transition-all duration-150"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-4 pt-4 pb-6 space-y-2 animate-fade-in">
                {/* Profile */}
                {user && (
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-3 py-2 border-b-2 border-amber-900/50 mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ImageWithFallback src={avatarSrc} alt={user.username} size={36} className="rounded-full" />
                    <span
                      className={`text-[15px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-amber-100'} group-hover:text-amber-500  dark:group-hover:text-amber-500  truncate whitespace-nowrap max-w-[120px] block`}
                      title={user.username}
                    >
                      {user.username}
                    </span>
                  </Link>
                )}

                {user && (
                  <>
                    <Link
                      href="/challenges"
                      className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Flag size={18} className="mr-1" /> Quests
                    </Link>
                    {scoreboardOptionCount > 0 && (
                      scoreboardOptionCount === 1 ? (
                        <Link
                          href={showTeamLeaderboard ? '/teams/scoreboard' : '/scoreboard'}
                          className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Trophy size={18} className="mr-1" /> Leaderboard
                        </Link>
                      ) : (
                        <details className="rounded-lg">
                          <summary className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30'}`}>
                            <Trophy size={18} className="mr-1" /> Leaderboard
                          </summary>
                          <div className="mt-1 ml-6 flex flex-col gap-1">
                            {showUserLeaderboard && (
                              <Link
                                href="/scoreboard"
                                className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-amber-500  hover:bg-amber-900/30' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30'}`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span className="flex items-center">
                                  <User size={18} className="mr-1" />
                                  User Leaderboard
                                </span>
                              </Link>
                            )}
                            {showTeamLeaderboard && (
                              <Link
                                href="/teams/scoreboard"
                                className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-amber-500  hover:bg-amber-900/30' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30'}`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span className="flex items-center">
                                  <Users size={18} className="mr-1" />
                                  Team Leaderboard
                                </span>
                              </Link>
                            )}
                          </div>
                        </details>
                      )
                    )}
                    {APP.teams.enabled && (
                      <Link
                        href="/teams"
                        className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users size={18} className="mr-1" /> Guilds
                      </Link>
                    )}
                  </>
                )}

                {!user && (
                  <Link
                    href="/preview"
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText size={18} className="mr-1" /> Preview
                  </Link>
                )}

                {/* Info Menu - Mobile */}
                <details className="rounded-lg">
                  <summary className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30'}`}>
                    <BookOpen size={18} className="mr-1" /> Info
                  </summary>
                  <div className="mt-1 ml-6 flex flex-col gap-1">
                    <Link
                      href="/info"
                      className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-amber-500  hover:bg-amber-900/30' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <Info size={18} className="mr-1" /> Info
                      </span>
                    </Link>
                    <Link
                      href="/rules"
                      className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-amber-500  hover:bg-amber-900/30' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <Scale size={18} className="mr-1" /> Rules
                      </span>
                    </Link>
                    <Link
                      href="/docs"
                      className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-amber-500  hover:bg-amber-900/30' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <BookOpen size={18} className="mr-1" /> Docs
                      </span>
                    </Link>
                  </div>
                </details>

                {user && (
                  <Link
                    href="/attack-feed"
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${pathname === '/attack-feed' ? (theme === 'dark' ? 'text-red-400 bg-amber-900/20' : 'text-red-600 bg-red-50') : (theme === 'dark' ? 'text-gray-200 hover:text-red-400 hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-amber-500 ')}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Flame size={18} className="mr-1 text-red-600 dark:text-red-400" /> Attack-Feed
                  </Link>
                )}

                {user && (
                  <Link
                    href="/hall-of-fame"
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${pathname === '/hall-of-fame' ? (theme === 'dark' ? 'text-yellow-400 bg-amber-900/20' : 'text-yellow-600 bg-yellow-50') : (theme === 'dark' ? 'text-gray-200 hover:text-yellow-400 hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 focus:ring-2 focus:ring-amber-500 ')}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy size={18} className="mr-1 text-yellow-500 dark:text-yellow-400" /> Hall of Fame
                  </Link>
                )}

                {user && (
                  <>
                    {adminStatus && (
                      <Link
                        href="/admin"
                        className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield size={18} className="mr-1" /> Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150"
                    >
                      Logout
                    </button>
                  </>
                )}

                {!user && (
                  <>
                    <Link
                      href="/login"
                      className={`flex px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-amber-500  hover:bg-amber-500  text-white' : 'bg-amber-500  hover:bg-amber-500  text-white'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={`flex px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-amber-900/20 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      {process.env.NODE_ENV === 'development' && (
        <DevConfigDialog open={devConfigOpen} onOpenChange={setDevConfigOpen} />
      )}
    </>
  )
}

